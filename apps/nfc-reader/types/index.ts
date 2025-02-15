export enum EWebsocketClient {
  READER = 'READER',
  HANDLER = 'HANDLER',
}
export enum ENFCScanStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
export interface INfcScanDTO {
  deviceExtendedUniqueIdentifier: string
  applicationExtendedUniqueIdentifier?: string
}

export interface INFCRecordObject {
  id: string
  recordType: string
  mediaType: string
  encoding: string
  lang: string
  data: string
}

export interface INfcResponseDTO {
  message?: string
  status: ENFCScanStatus
}

export type TNDEFRecordMessageHeader = 'AppId' | 'DevEUI'
