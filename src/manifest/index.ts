import * as fs from "fs";
import * as path from "path";

export class Manifest {
  id: number;
  name: string;
  associatedServerId: number;
  subject: string;
  active: boolean;

  constructor(
    public readonly localRoot: string,
  ) {

  }

  public write(): void {
    fs.writeFileSync(path.join(this.localRoot, "template.json"), JSON.stringify(this.toSchema(), null, "\t"));
  }

  public toSchema(): any {
    return {
      id: this.id,
      name: this.name,
      associatedServerId: this.associatedServerId,
      subject: this.subject,
      active: this.active,
    };
  }
}

