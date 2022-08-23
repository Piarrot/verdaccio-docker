import { fs, path, YAML } from "zx";

if (!process.env.PACKAGE_SCOPES) {
    console.error("Configure .env before executing script");
    process.exit(1);
}

const packagesScopes = process.env.PACKAGE_SCOPES.split(" ");
const admins = process.env.PACKAGE_ADMINS.split(" ");

const isSingleScope = packagesScopes.length == 1;

const config = YAML.parse(
    await fs.readFile(path.join(__dirname, "config.yaml"), "utf-8")
);

if (isSingleScope) {
    config.web.scope = packagesScopes[0];
}

config.web.title = process.env.TITLE;

config.packages = {};

packagesScopes.forEach((p) => {
    config.packages[p] = {
        access: `github/org/${process.env.GITHUB_ORG_NAME}`,
        publish: admins.map((a) => `github/user/${a}`).join(" "),
    };
});

config["github-oauth-ui"] = {
    "client-id": process.env.GITHUB_CLIENT_ID,
    "client-secret": process.env.GITHUB_CLIENT_SECRET,
    token: process.env.GITHUB_TOKEN,
};

await fs.writeFile(
    path.join(__dirname, "../../docker/conf/config.yaml"),
    YAML.stringify(config, {
        indent: 4,
    }),
    "utf-8"
);
