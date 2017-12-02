import * as util from "util";
import { Postmark } from "../postmark/postmark";

exports.name = "init";
exports.describe = "Downloads all templates from postmarkapp.com into a local directory that can be managed by this CLI";
exports.builder = {
  postmarkServerToken: {
    type: "string",
    demand: true,
  },
  templateRoot: {
    type: "string",
    demand: false,
    default: "./",
  }
};

exports.handler = (argv) => {
  main(argv).catch((err) => {
    console.log(`Failed with error ${util.inspect(err)}`);
    process.exit(1);
  });
};

export async function main(argv: any): Promise<void> {
  new Postmark(
    argv.postmarkServerToken,
    argv.templateRoot,
  ).download();
}
