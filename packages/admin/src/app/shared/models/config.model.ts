interface ArcwellModel {
  id: string;
  name: string;
}

interface MailModel {
  host: string;
  port: number;
  fromAddress: string;
  fromName: string;
}

export class ConfigModel {
  public arcwell: ArcwellModel;
  public mail: MailModel;

  constructor(data: any) {
    this.arcwell = data.arcwell;
    this.mail = data.mail;
  }
}
