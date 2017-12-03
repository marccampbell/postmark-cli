import * as util from "util";
import * as _ from "lodash";
import * as Promise from "bluebird";
import * as process from "process";
import * as postmark from "postmark";
import { statSync, readdirSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { Manifest } from "../manifest";

Promise.promisifyAll(postmark);

interface Template {
  name: string;
  templateId: number;
  active: boolean;
}

export class Postmark {
  private client: postmark.Client;

  constructor(
    private readonly serverToken: string,
    private readonly templateRoot: string,
  ) {
    this.client = new postmark.Client(serverToken);
  }

  public async download(): Promise<void> {
    console.log(`Downloading all postmark templates and storing in ${resolve(this.templateRoot)}`);

    const templates = await this.getAllDestinationTemplates();
    for (const template of templates) {
      await this.downloadTemplate(template);
    }

    console.log(`Done! Check out the ${resolve(this.templateRoot)}`);
  }

  public async sync(): Promise<void> {
    console.log(`Syncing postmark templates from ${resolve(this.templateRoot)}`);

    const sourceTemplates = await this.getAllSourceTemplates();
    const destinationTemplates = await this.getAllDestinationTemplates();

    for (const sourceTemplate of sourceTemplates) {
      if (sourceTemplate.id) {
        await this.replaceTemplate(sourceTemplate);
      } else {
        await this.createTemplate(sourceTemplate);
      }
    }

  }

  private async downloadTemplate(template: Template): Promise<boolean> {
    try {
      console.log(`   Downloading ${template.name}...`);

      const item = await this.client.getTemplate(template.templateId);
      const templateDir = join(resolve(this.templateRoot), item.Name);
      mkdirSync(templateDir);

      const manifest: Manifest = new Manifest(templateDir);
      manifest.id = item.TemplateId,
      manifest.associatedServerId = item.AssociatedServerId,
      manifest.name = item.Name,
      manifest.subject = item.Subject,
      manifest.active = item.Active,

      writeFileSync(join(templateDir, "body.html"), item.HtmlBody);
      writeFileSync(join(templateDir, "body.txt"), item.TextBody);
      manifest.write();

      console.log(`   ...finished (saved to ${templateDir}`)
      return true;
    } catch (err) {
      console.error(util.inspect(err));
      throw err;
    }
  }

  private async getAllDestinationTemplates(): Promise<Template[]> {
    let offset = 0;
    let pageSize = 50;
    let isLastPage = false;

    const templates: Template[] = [];
    while (!isLastPage) {
      const page = await this.getPageOfDestinationTemplates(pageSize, offset);
      templates.push(...page);
      isLastPage = page.length < pageSize;
    }

    return templates;
  }

  private async getPageOfDestinationTemplates(count: number, offset: number): Promise<Template[]> {
    try {
      const page = await this.client.getTemplates({ Cound: count, Offset: offset });
      const templates: Template[] = [];
      for (const item of page.Templates) {
        const template: Template = {
          name: item.Name,
          templateId: item.TemplateId,
          active: item.Active,
        };

        templates.push(template);
      }

      return templates;
    } catch (err) {
      console.error(util.inspect(err));''
      throw err;
    }
  }

  private async getAllSourceTemplates(): Promise<Manifest[]> {
    try {
      const templateDirs = _.filter(readdirSync(resolve(this.templateRoot)), (p) => {
        const stat = statSync(join(resolve(this.templateRoot), p));
        return stat.isDirectory();
      });

      const manifests: Manifest[] = [];
      for (const templateDir of templateDirs) {
        const absoluteTemplateDir = join(this.templateRoot, templateDir);
        const manifestFile = join(absoluteTemplateDir, "template.json");
        if (!existsSync(manifestFile)) {
          continue;
        }

        const b = JSON.parse(readFileSync(manifestFile).toString("utf-8"));

        const manifest: Manifest = new Manifest(absoluteTemplateDir);
        manifest.id = b.id,
        manifest.associatedServerId = b.associatedServerId,
        manifest.name = b.name,
        manifest.subject = b.subject,
        manifest.active = b.active,
        manifests.push(manifest);
      }

      return manifests;
    } catch (err) {
      console.error(util.inspect(err));
      throw err;
    }
  }

  private async createTemplate(template: Manifest): Promise<boolean> {
    try {
      const templateDir = join(resolve(this.templateRoot), template.localRoot!);
      console.log(`   Uploading ${template.name} from ${templateDir}`);
      const html = readFileSync(join(templateDir, "body.html")).toString("utf-8");
      const text = readFileSync(join(templateDir, "body.txt")).toString("utf-8");

      const postBody = {
        "Name": template.name,
        "Subject": template.subject,
        "HtmlBody": html,
        "TextBody": text,
      };

      const response = await this.client.createTemplateAsync(postBody);
      console.log(`   ... upload complete`);

      template.id = response.TemplateId;
      template.active = response.Active;

      template.write();
      return true;
    } catch (err) {
      console.error(util.inspect(err));
      throw err;
    }
  }

  private async replaceTemplate(template: Manifest): Promise<boolean> {
    try {
      const templateDir = join(resolve(this.templateRoot), template.localRoot!);
      console.log(`   Uploading ${template.name} from ${templateDir}`);
      const html = readFileSync(join(templateDir, "body.html")).toString("utf-8");
      const text = readFileSync(join(templateDir, "body.txt")).toString("utf-8");

      const putBody = {
        "TemplateId": template.id,
        "Name": template.name,
        "Subject": template.subject,
        "HtmlBody": html,
        "TextBody": text,
      };

      this.client.editTemplateAsync(template.id, putBody);

      console.log(`   ... upload complete`);
      return true;
    } catch (err) {
      console.error(util.inspect(err));
      throw err;
    }
  }
}
