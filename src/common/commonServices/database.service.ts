import {
  DynamoDBClient,
  // QueryCommand
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  TransactWriteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import ERRORS from '../constants/error.constants';

@Injectable()
export class DatabaseService {
  private _DynamoDB: any;

  constructor() {
    const client = new DynamoDBClient({
      // Your config options
      endpoint: 'http://localhost:8000',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeMysecretAccessKey',
      },
      // sslEnabled: true,
      // convertEmptyValues: true,
    });
    const marshallOptions = {
      // Whether to automatically convert empty strings, blobs, and sets to `null`.
      convertEmptyValues: false,
      removeUndefinedValues: true, // false, by default.
      // convertClassInstanceToMap: false, // false, by default.
    };
    const unmarshallOptions = {
      // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
      wrapNumbers: false, // false, by default.
    };
    const translateConfig = { marshallOptions, unmarshallOptions };

    this._DynamoDB = DynamoDBDocumentClient.from(client, translateConfig);
  }

  /**
   * Opt.collection: {String} - Name of dynamo table.
   * Opt.identifiers: {Object} - Key value pair of identifiers
   */
  public async getEntity(options) {
    const params = {
      TableName: options.collection,
      Key: options.identifiers,
    };

    const command = new GetCommand(params);
    try {
      const response = await this._DynamoDB.send(command);
      if (!response.Item) {
        const err = new Error(
          'Entity not found in DynamoDB ' + JSON.stringify(options)
        );
        err.name = ERRORS.HTTP.RESOURCE_NOT_FOUND;
        throw err;
      }
      return response.Item;
    } catch (e) {
      console.log('Dynamo Error', e.stack);
      throw e;
    }
  }

  /**
   * Opt.collection: {String} - Name of dynamo table.
   * Opt.body: {JSON} - JSON data object for the entity
   * Opt.identifiers: {Object} {key: value, key: value}
   * Opt.bCreateIfNotExists Boolean
   */
  public async putEntity(options) {
    const params = this._getCreateOperationOptions(options);
    params['ReturnValues'] = 'ALL_OLD';
    const command = new PutCommand(params);

    try {
      const response = await this._DynamoDB.send(command);
      if (options.bCreateIfNotExists) {
        console.log('Success - item added', response);
      } else {
        console.log('Success - item updated', response);
      }

      return response;
    } catch (e) {
      if (e.name === 'ConditionalCheckFailedException') {
        const err = new Error(
          'Entity already exists in DDB ' + JSON.stringify(options)
        );
        err.name = ERRORS.DATABASE.CONDITIONAL_CHECK_FAILED;
        console.log(err);
        throw err;
      }
      throw e;
    }
  }

  /**
   * Opt.collection: {String} - Name of dynamo table.
   * Opt.identifiers: {Object} - Key value pair of identifiers
   * Opt.indexCollection: {String} - Name of the secondary index
   * Opt.filter : { key: space_key, value: 'org_' }
   *
   * Opt.cursor: {String} - Cursor to get next set of entities.
   * Opt.limit: {Integer} - Maximum number of entities to scan at once(MAX-500).
   * Opt.sortOrder: {String} - Order of traversal ('asc' or 'desc'), default is 'asc'.
   */
  public async queryCollectionFilterBeginsWith(options: {
    collection: string;
    identifiers: object;
    filter: { key: string; value: string };
    indexCollection?: string;
    cursor?: string;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
    ql?: string;
  }) {
    const params: {
      TableName: string;
      IndexName: string;
      KeyConditionExpression: string;
      ExpressionAttributeValues: object;
      ExpressionAttributeNames?: object;
      FilterExpression?: [];
      ExclusiveStartKey?: object;
      Limit: number;
      ScanIndexForward: string;
    } = {
      TableName: options.collection,
      IndexName: options.indexCollection,
      KeyConditionExpression: '',
      ExpressionAttributeValues: {},
      // ExpressionAttributeNames: {}, // added extra
      // FilterExpression: [], // added extra
      ExclusiveStartKey: this._convertCursorFromStringToObject(options.cursor),
      Limit: options.limit,
      ScanIndexForward: options.sortOrder,
    };

    if (options.ql) {
      const res = this._convertSQLToDynamoDbQuery(options.ql);
      params.FilterExpression = res.FilterExpression;
      params.ExpressionAttributeNames = res.ExpressionAttributeNames;
      params.ExpressionAttributeValues = res.ExpressionAttributeValues;
    }

    let keyIndex = 1;
    for (const key in options.identifiers) {
      params.ExpressionAttributeValues[':v' + keyIndex] =
        options.identifiers[key];
      if (keyIndex !== 1) {
        params.KeyConditionExpression += ' and ';
      }
      params.KeyConditionExpression += key + ' = ' + ':v' + keyIndex;
      keyIndex += 1;
    }

    if (options.filter) {
      params.ExpressionAttributeValues[':v' + keyIndex] = options.filter.value;
      if (keyIndex !== 1) {
        params.KeyConditionExpression += ' and ';
      }
      params.KeyConditionExpression +=
        'begins_with(' + options.filter.key + ', :v' + keyIndex + ')';
      keyIndex += 1;
    }

    const data = { params: params, options: options };
    try {
      const res = this._execQueryCollection(data);
      return res;
    } catch (e) {
      return e;
    }
  }

  /*
options = {
  transactItems: [
    {
      create: {
        collection: {String} - Name of dynamo table.
        body: {JSON} - JSON data object for the entity
        identifiers: {Object} {key: value, key: value}
        bCreateIfNotExists Boolean
      }
    },
    {
      delete: {
        collection: {String} - Name of dynamo table.
        identifiers: {Object} - Key value pair of identifiers
        bDeleteIfExists: {Boolean} - true/false - optional
      }
    },
    {
      update: {
        collection: {String} - Name of dynamo table.
        identifiers: {Object} - Key value pair of identifiers.
        body: {JSON} - JSON data object for the entity.
        conditionalChecks: [{key: '', value: '', operator: ''}, {}, ...].
      }
    }
  ]
}
*/
  public async transactWrite(options) {
    const dynamoDBOptions = this._createTransactionOptions(options);

    const command = new TransactWriteCommand(dynamoDBOptions);

    try {
      const response = await this._DynamoDB.send(command);

      console.log('Success - TransactWriteCommand', response);

      return response;
    } catch (e) {
      if (e.name === 'ConditionalCheckFailedException') {
        const err = new Error(
          'ConditionalCheckFailedException in DDB ' + JSON.stringify(options)
        );
        err.name = ERRORS.DATABASE.CONDITIONAL_CHECK_FAILED;
        console.log(err);
        throw err;
      }
      throw e;
    }
  }

  /**
   * Opt.collection: {String} - Name of dynamo table.
   * Opt.body: {JSON} - JSON data object for the entity
   * Opt.identifiers: {Object} {key: value, key: value}
   * Opt.bCreateIfNotExists Boolean
   */
  private _getCreateOperationOptions(options) {
    // Add bydefault fields in body
    if (options.body) {
      options.body.modified = Date.now();
      if (!options.body.version) {
        options.body.version = 1;
      }
    }
    const params = {
      TableName: options.collection,
      Item: options.body,
    };

    if (options.bCreateIfNotExists && options.identifiers) {
      const formattedCondition = this._createDynamoDbConditionExpression(
        options.identifiers
      );
      Object.assign(params, formattedCondition);
    }

    return params;
  }

  /**
   * Opt.collection: {String} - Name of dynamo table.
   * Opt.identifiers: {Object} - Key value pair of identifiers
   * Opt.bDeleteIfExists: {Boolean} - true/false - optional
   *  { If true, checks if exists,
   *  1. if exists, deletes entity
   *  2. else throws 'ConditionalCheckFailedException' }
   */
  private _getDeleteOperationOptions(options) {
    const params = {
      TableName: options.collection,
      Key: options.identifiers,
      ReturnValues: 'ALL_OLD',
    };

    if (options.bDeleteIfExists && options.identifiers) {
      const formattedCondition =
        this._createDynamoDBConditionExpressionForDelete(options.identifiers);
      Object.assign(params, formattedCondition);
    }

    return params;
  }

  /**
   * Opt.collection: {String} - Name of dynamo table.
   * Opt.identifiers: {Object} - Key value pair of identifiers.
   * Opt.body: {JSON} - JSON data object for the entity.
   * Opt.increment: [{key: '', value: num, operator: '+/-'}, {}, ...].
   * Opt.listAppend: [{key: '', value: [{},..], appendAtStart: true(//default is false)}, {}, ...].
   * Opt.removeAttribs: ['key1', 'k1-->>k2'] - Array of keys(nested/top-level) to be removed the entity.
   * Opt.conditionalChecks: [{key: '', value: '', operator: ''}, {}, ...].
   * Ex: conditionalChecks = [{key: 'duedate', value: 1769882899, operator: '>'}, {...}].
   *     This should evaluate to true for a successful update. Else,
   *     returns conditional request failed (statusCode: '400').
   */
  private _getUpdateOperationOptions(options) {
    // Add bydefault fields in body
    if (options.body) {
      options.body.modified = Date.now();
    } else {
      options.body = { modified: Date.now() };
    }

    const res = this._genUpdateExpression(
      options.body,
      options.conditionalChecks
    );
    if (options.setIfNotExists) {
      this._genSetIfNotExistsUpdateExpression(res, options.setIfNotExists);
    }
    if (options.attributeCheck) {
      this._addAttributeCheck(res, options.attributeCheck);
    }
    // if (options.increment) {
    //   _genIncrementUpdateExpression(res, options.increment);
    // }
    // if (options.listAppend) {
    //   _genListAppendUpdateExpression(res, options.listAppend);
    // }

    /**
     * This removeAttribs block should always be at the bottom as this _genRemUpdateExpression function appends
     * the Remove command at the end of the update expression.
     * So all the Set exp should be at the beginning and the Remove exp should be at the end.
     * Notes:
     * 1. Keep Set and Remove blocks separate. Set block above and the Remove block below.
     * 2. In future if any new Remove functionality is added in Remove block below. Remove command initiation should be done smartly.
     */
    // if (options.removeAttribs) {
    //   _genRemoveAttribsUpdateExpression(res, options.removeAttribs);
    // }

    const params = {
      TableName: options.collection,
      Key: options.identifiers,
      UpdateExpression: res.updateExp,
      ExpressionAttributeValues: res.attributeVals,
      ExpressionAttributeNames: res.attributeKeys,
      ConditionExpression: res.conditionExpression,
      ReturnValues: options.returnValues || 'ALL_NEW',
    };

    return params;
  }

  private _createDynamoDbConditionExpression(identifiers) {
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    const ConditionExpressionArr: string[] = [];

    let count = 1;

    for (const idx in identifiers) {
      ExpressionAttributeNames['#k' + count] = idx;
      ExpressionAttributeValues[':v' + count] = identifiers[idx];
      ConditionExpressionArr.push(' NOT #k' + count + ' = :v' + count);
      count++;
    }
    const ConditionExpression = ConditionExpressionArr.join(' AND ');

    const conditionExpressionObj = {
      ExpressionAttributeNames: ExpressionAttributeNames,
      ExpressionAttributeValues: ExpressionAttributeValues,
      ConditionExpression: ConditionExpression,
    };

    return conditionExpressionObj;
  }

  private _createDynamoDBConditionExpressionForDelete(identifiers) {
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    const ConditionExpressionArr: string[] = [];

    let count = 1;

    for (const idx in identifiers) {
      ExpressionAttributeNames['#k' + count] = idx;
      ExpressionAttributeValues[':v' + count] = identifiers[idx];
      ConditionExpressionArr.push(' #k' + count + ' = :v' + count);
      count++;
    }
    const ConditionExpression = ConditionExpressionArr.join(' AND ');
    const conditionExpressionObj = {
      ExpressionAttributeNames: ExpressionAttributeNames,
      ExpressionAttributeValues: ExpressionAttributeValues,
      ConditionExpression: ConditionExpression,
    };
    return conditionExpressionObj;
  }

  // setIfNotExistsBody = [{key: '', value: num}, {}, ...].
  // This function will set a key in dynamo entity only if it already do not exists there.
  private _genSetIfNotExistsUpdateExpression(res, setIfNotExistsBody) {
    const setIfNotExistsUpdateExp = [];
    let keyNo = 1;
    for (let i = 0; i < setIfNotExistsBody.length; i++) {
      res.attributeVals[':upv' + keyNo] = setIfNotExistsBody[i].value;
      res.attributeKeys['#upk' + keyNo] = setIfNotExistsBody[i].key;
      setIfNotExistsUpdateExp.push(
        `#upk${keyNo} = if_not_exists(#upk${keyNo}, :upv${keyNo})`
      );
      keyNo++;
    }
    if (setIfNotExistsUpdateExp.length) {
      res.updateExp = res.updateExp + ', ' + setIfNotExistsUpdateExp.join(', ');
    }
  }

  private _addAttributeCheck(body, attributeCheck) {
    const keysArr = [];
    if (attributeCheck.keysExists && attributeCheck.keysExists.length) {
      for (const key of attributeCheck.keysExists) {
        keysArr.push('attribute_exists(' + key + ')');
      }
    }

    if (attributeCheck.keysNotExists && attributeCheck.keysNotExists.length) {
      for (const key of attributeCheck.keysNotExists) {
        keysArr.push('attribute_not_exists(' + key + ')');
      }
    }
    let attributeString;

    //if more than 1 key in keysExists or keysNotExists then keySeperator is needed else code will not work without returning error
    if (attributeCheck.keySeperator) {
      attributeString = keysArr.join(attributeCheck.keySeperator);
    } else {
      attributeString = keysArr[0];
    }

    if (attributeString.length) {
      body.conditionExpression = `(${attributeString}) ${attributeCheck.groupSeperator} (${body.conditionExpression})`;
    }
  }
  /**
   * body = {key1: 'val1', 'k1-->>k2-->>k3': 'val2' (nested keys)},
   * conditionalChecks = [{key: 'a', value: 'b', operator: '>'}, {...}] optional
   */
  private _genUpdateExpression(body, conditionalChecks) {
    const seperator = '-->>'; // nestedKeySeparator
    const updateExp = [];
    const attributeKeys = {};
    const attributeVals = {};
    const conditionExpression = [];
    let keyNo = 1;
    for (const key in body) {
      const keyArr = key.split(seperator);

      if (keyArr.length > 1) {
        let keyName = 'k' + keyNo,
          nestedCount = 1;
        const exp = [];

        for (const keyPart of keyArr) {
          attributeKeys['#' + keyName] = keyPart;
          exp.push('#' + keyName);
          keyName = 'k' + keyNo + 'n' + nestedCount;
          nestedCount++;
        }
        updateExp.push(exp.join('.') + ' = :v' + keyNo);
      } else {
        updateExp.push('#k' + keyNo + ' = :v' + keyNo);
        attributeKeys['#k' + keyNo] = key;
      }

      attributeVals[':v' + keyNo] = body[key];
      keyNo += 1;
    }
    if (conditionalChecks) {
      for (let keyObj = 0; keyObj < conditionalChecks.length; keyObj++) {
        attributeVals[':v' + keyNo] = conditionalChecks[keyObj].value;
        attributeKeys['#k' + keyNo] = conditionalChecks[keyObj].key;
        conditionExpression.push(
          '#k' +
            keyNo +
            ' ' +
            conditionalChecks[keyObj].operator +
            ' ' +
            ':v' +
            keyNo
        );
        keyNo++;
      }
    }

    const returnObj = {
      updateExp: 'set ' + updateExp.join(', '),
      attributeVals: attributeVals,
      attributeKeys: attributeKeys,
      conditionExpression: conditionExpression.join(' AND ') || undefined,
    };

    return returnObj;
  }

  /*
  options = {
    transactItems: [
      {
        create: {
          collection: {String} - Name of dynamo table.
          body: {JSON} - JSON data object for the entity
          identifiers: {Object} {key: value, key: value}
          bCreateIfNotExists Boolean
        }
      },
      {
        delete: {
          collection: {String} - Name of dynamo table.
          identifiers: {Object} - Key value pair of identifiers
          bDeleteIfExists: {Boolean} - true/false - optional
        }
      },
      {
        update: {
          collection: {String} - Name of dynamo table.
          identifiers: {Object} - Key value pair of identifiers.
          body: {JSON} - JSON data object for the entity.
          conditionalChecks: [{key: '', value: '', operator: ''}, {}, ...].
        }
      }
    ]
  }
  */
  private _createTransactionOptions(options) {
    const dynamoParams = { TransactItems: [] };
    for (const idx in options.transactItems) {
      const operationJSON = options.transactItems[idx];
      const operationMethod = Object.keys(operationJSON)[0];
      const operationOptions = operationJSON[operationMethod];
      switch (operationMethod) {
        case 'create':
          dynamoParams.TransactItems.push({
            Put: this._getCreateOperationOptions(operationOptions),
          });
          break;
        case 'delete':
          dynamoParams.TransactItems.push({
            Delete: this._getDeleteOperationOptions(operationOptions),
          });
          break;
        case 'update':
          dynamoParams.TransactItems.push({
            Update: this._getUpdateOperationOptions(operationOptions),
          });
          break;
        default:
          console.error(
            'Unsupported operation method of DynamoDB called in transactWrite.' +
              operationMethod
          );
      }
    }
    return dynamoParams;
  }

  private async _execQueryCollection(data) {
    const params = data.params,
      options = data.options;
    const command = new QueryCommand(params);

    try {
      const response = await this._DynamoDB.send(command);

      console.log('Success - execQueryCollection ', response);

      if (Object.keys(response).length === 0) {
        const err = new Error(
          'Entity not found in DynamoDB ' + JSON.stringify(options)
        );
        err.name = ERRORS.DATABASE.ENTITY_NOT_FOUND;
        console.log(err);
        throw err;
      } else {
        return {
          entities: response.Items,
          count: response.Count,
          cursor: this._convertCursorFromObjectToString(
            response.LastEvaluatedKey
          ),
        };
      }
    } catch (e) {
      throw e;
    }
  }

  private _convertCursorFromStringToObject(string) {
    if (!string) {
      return;
    }
    const object = {};
    const keyValPairs = string.split('$$');
    for (let idx = 0; idx < keyValPairs.length; idx++) {
      const key = keyValPairs[idx].split('=')[0];
      const value = keyValPairs[idx].split('=')[1];
      object[key] = value;
    }
    return object;
  }

  /**
   * @param {String} - Simple SQL query
   * @returns {Object} - key to make ExpressionAttributeValues and FilterExpression
   * Example:
   * input:
   * query = (key1 = value1 and key2 = value2) or key3 = value3
   * output:
   * FilterExpression: '(#key1 = :k1 and #key2 = :k2) or #key3 = :k3'
   * ExpressionAttributeNames: { #key1: key1, #keys2: key2 }
   * ExpressionAttributeValues: { ':k1': 'value1', ':k2': 'value2', ':k3': 'value3' }
   * TODO: Future support for array, map in SQL query
   */
  private _convertSQLToDynamoDbQuery(query) {
    const splittedQuery = query.split('=');
    let valueStr;
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    splittedQuery[0] = splittedQuery[0].trim();
    for (let i = 1; i < splittedQuery.length; i++) {
      splittedQuery[i] = splittedQuery[i].trim();
      if (splittedQuery[i].indexOf('and') > -1) {
        valueStr = splittedQuery[i].split(' and ')[0];
      } else if (splittedQuery[i].indexOf('or') > -1) {
        valueStr = splittedQuery[i].split(' or ')[0];
      } else {
        valueStr = splittedQuery[i];
      }
      valueStr = valueStr.split(')')[0];
      ExpressionAttributeValues[':qlv' + i] = valueStr;
      splittedQuery[i] = splittedQuery[i].substr(
        valueStr.length,
        splittedQuery[i].length - valueStr.length
      );
      splittedQuery[i] = ':qlv' + i + splittedQuery[i];
    }

    for (let idx = 0; idx < splittedQuery.length - 1; idx++) {
      let key = splittedQuery[idx].split(' ');
      key = key[key.length - 1];
      key = key.split('(');
      key = key[key.length - 1];
      // ref - https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
      if (key.indexOf('.') === -1) {
        ExpressionAttributeNames['#qlk' + idx] = key;
        splittedQuery[idx] =
          splittedQuery[idx].substr(0, splittedQuery[idx].length - key.length) +
          '#qlk' +
          idx;
      }
    }

    const FilterExpression = splittedQuery.join(' = ');
    return {
      ExpressionAttributeNames: ExpressionAttributeNames,
      ExpressionAttributeValues: ExpressionAttributeValues,
      FilterExpression: FilterExpression,
    };
  }

  private _convertCursorFromObjectToString(object) {
    if (!object) {
      return;
    }
    let result = '';
    for (const idx in object) {
      result = result + idx + '=' + object[idx];
      result += '$$';
    }
    return result.substring(0, result.length - 2);
  }
}
