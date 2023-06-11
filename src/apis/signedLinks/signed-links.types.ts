export type TsignedLinksBody = {
  projectId: string;
  base: {
    fileName: string;
    extn: string;
    contentLength: number;
    localPath: string;
    uuid?: string; // if already created
    url?: string; // s3 url if already created
  };

  overlay: {
    fileName: string;
    extn: string;
    contentLength: number;
    localPath: string;
    uuid?: string; // if already created
    url?: string; // s3 url if already created
  };
};
