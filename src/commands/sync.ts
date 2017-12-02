import * as util from "util";
import { Postmark } from "../postmark/postmark";

exports.name = "sync";
exports.describe = "Sync a directory of local templates to postmarkapp.com";
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
  ).sync();
}
