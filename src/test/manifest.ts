import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import { Manifest } from "../manifest";
import { exec } from "child_process";

@suite class ManifestTest {
  @test public async "manifest.toSchema()"() {
    const manifest: Manifest = new Manifest("./");
    manifest.id = 1;
    manifest.name = "name";
    manifest.subject = "subject";
    manifest.associatedServerId = 2;
    manifest.active = true;

    const schema = manifest.toSchema();

    const expected = {
      id: 1,
      active: true,
      subject: "subject",
      name: "name",
      associatedServerId: 2,
    };

    expect(schema).to.deep.equal(expected);
  }

  @test public async "manifest.write()"() {
    const manifest: Manifest = new Manifest("./");
    manifest.id = 1;
    manifest.name = "name";
    manifest.subject = "subject";
    manifest.associatedServerId = 2;
    manifest.active = true;

    const jsonPath = path.join(manifest.localRoot, "template.json");
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
    }
    expect(fs.existsSync(jsonPath)).to.be.false;
    manifest.write();
    expect(fs.existsSync(jsonPath)).to.be.true;

    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
    }
  }
}
