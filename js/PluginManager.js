import fs from "fs";

import { browser } from "$app/environment";
import ApiUtil from "$lib/api.util.js";
import { API_URL, PLUGIN_DEV_MODE } from "$lib/variables.js";
import { base } from "$app/paths";

let path, url, admZip;

if (!browser) {
  const pathStuff = await import("path");
  const urlStuff = await import("url");
  const admZipStuff = await import("adm-zip");

  path = pathStuff;
  url = urlStuff;
  admZip = admZipStuff.default;
}

const plugins = {};

const pluginsFolder = "plugins";
const manifestFileName = "manifest.json";
const pluginUiZipFileName = "plugin-ui.zip";

function log(message) {
  console.log(`[Plugin Manager] ${message}`);
}

const pano = {
  isPanel: base === "/panel",
};

function createPluginsFolder() {
  if (!fs.existsSync(pluginsFolder)) {
    fs.mkdirSync(pluginsFolder, { recursive: true });
  }
}

function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (error) {
    return false;
  }
}

function isDirectoryEmpty(directoryPath) {
  try {
    const items = fs.readdirSync(directoryPath);
    return items.length === 0;
  } catch (error) {
    return false;
  }
}

async function downloadAndExtractZip(file, outputDir) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const zip = new admZip(buffer, {});

  zip.extractAllTo(outputDir, true);
}

function readPluginsFromFolder() {
  const readPluginsFolder = fs.readdirSync(pluginsFolder);

  const plugins = {};

  readPluginsFolder
    .filter((pluginId) => isDirectory(path.join(pluginsFolder, pluginId)))
    .forEach((pluginId) => {
      try {
        const manifestFile = fs.readFileSync(
          path.join(pluginsFolder, pluginId, manifestFileName),
          {
            encoding: "utf8",
            flag: "r",
          },
        );

        plugins[pluginId] = JSON.parse(manifestFile);
      } catch (_) {}
    });

  return plugins;
}

async function downloadPluginUiZip(pluginId) {
  return await ApiUtil.get({
    path: `/api/plugins/${pluginId}/resources/${pluginUiZipFileName}`,
    blob: true,
  });
}

async function verifyPlugins(pluginsInFolder, pluginsInfo) {
  const pluginIdInFolderList = Object.keys(pluginsInFolder);

  // Fix broken plugin folder, if it doesn't contain server or client
  pluginIdInFolderList.forEach((pluginId) => {
    const pluginFolder = path.join(pluginsFolder, pluginId)
    const serverIsDirectory = isDirectory(
      path.join(pluginFolder, "server"),
    );
    const clientIsDirectory = isDirectory(
      path.join(pluginFolder, "client"),
    );

    let remove;

    if (serverIsDirectory && !clientIsDirectory) {
      fs.rmSync(path.join(pluginFolder, "server"), {
        recursive: true,
        force: true,
      });
      remove = true;
    }

    if (clientIsDirectory && !serverIsDirectory) {
      fs.rmSync(path.join(pluginFolder, "client"), {
        recursive: true,
        force: true,
      });
      remove = true;
    }

    if (remove) {
      log(`Fixing broken '${pluginId}' folder...`);
      delete pluginsInFolder[pluginId];
      delete plugins[pluginId];
      delete pluginIdInFolderList[pluginIdInFolderList.indexOf(pluginId)];

      fs.rmSync(path.join(pluginFolder, manifestFileName), {
        recursive: true,
        force: true,
      });

      if (isDirectoryEmpty(path.join(pluginFolder))) {
        fs.rmSync(path.join(pluginFolder), {
          recursive: true,
          force: true,
        });
      }
    }

    if (!isDirectory(path.join(pluginFolder, "server")) && !isDirectory(path.join(pluginFolder, "client")) && fs.existsSync(path.join(pluginFolder, manifestFileName))) {
      fs.rmSync(path.join(pluginFolder, manifestFileName), {
        recursive: true,
        force: true,
      });
    }
  });

  // Remove installed plugin if not in directory
  Object.keys(plugins)
    .filter((pluginId) => !pluginIdInFolderList.includes(pluginId))
    .forEach((pluginId) => {
      log(`Removing plugin '${pluginId}'...`);

      delete plugins[pluginId];
    });

  pluginIdInFolderList.forEach((pluginId) => {
    if (!PLUGIN_DEV_MODE && !pluginsInfo[pluginId]) {
      log(`Removing '${pluginId}' folder...`);

      fs.rmSync(path.join(pluginsFolder, pluginId, "server"), {
        recursive: true,
        force: true,
      });
      fs.rmSync(path.join(pluginsFolder, pluginId, "client"), {
        recursive: true,
        force: true,
      });
      fs.rmSync(path.join(pluginsFolder, pluginId, manifestFileName), {
        recursive: true,
        force: true,
      });

      if (isDirectoryEmpty(path.join(pluginsFolder, pluginId))) {
        fs.rmSync(path.join(pluginsFolder, pluginId), {
          recursive: true,
          force: true,
        });
      }

      delete plugins[pluginId];
      return;
    }

    const manifestFile = fs.readFileSync(
      path.join(pluginsFolder, pluginId, manifestFileName),
      {
        encoding: "utf8",
        flag: "r",
      },
    );

    // Create plugin
    plugins[pluginId] = JSON.parse(manifestFile);
  });

  if (!PLUGIN_DEV_MODE) {
    // Install plugin
    const notInstalledPlugins = Object.keys(pluginsInfo).filter(
      (pluginId) => !plugins[pluginId],
    );

    for (const pluginId of notInstalledPlugins) {
      const pluginFolder = path.join(pluginsFolder, pluginId);
      const manifestFilePath = path.join(pluginFolder, manifestFileName);
      const pluginManifest = pluginsInfo[pluginId];

      log(`Installing plugin '${pluginId}'...`);

      if (!fs.existsSync(pluginFolder)) {
        fs.mkdirSync(pluginFolder, { recursive: true });
      }

      plugins[pluginId] = { ...pluginManifest };

      log(`Downloading...`);

      const file = await downloadPluginUiZip(pluginId);

      await downloadAndExtractZip(file, pluginFolder);

      fs.writeFileSync(
        manifestFilePath,
        JSON.stringify(pluginManifest, null, 2),
      );

      log(`'${pluginId}' successfully installed.`);
    }

    // Verify plugin files
    for (const pluginId of Object.keys(plugins)) {
      const pluginFolder = path.join(pluginsFolder, pluginId);

      const pluginInfoManifest = pluginsInfo[pluginId];
      let pluginManifest = plugins[pluginId];

      // if files not valid
      if (
        pluginManifest.version !== pluginInfoManifest.version ||
        pluginManifest.uiHash !== pluginInfoManifest.uiHash
      ) {
        const manifestFilePath = path.join(pluginFolder, manifestFileName);

        log(`Updating plugin '${pluginId}'.`);

        plugins[pluginId] = pluginInfoManifest;
        pluginManifest = plugins[pluginId];
        fs.writeFileSync(
          manifestFilePath,
          JSON.stringify(pluginManifest, null, 2),
        );

        fs.rmSync(path.join(pluginsFolder, pluginId, "server"), {
          recursive: true,
          force: true,
        });
        fs.rmSync(path.join(pluginsFolder, pluginId, "client"), {
          recursive: true,
          force: true,
        });

        log(`Downloading...`);

        const file = await downloadPluginUiZip(pluginId);

        await downloadAndExtractZip(file, pluginFolder);
        log(`'${pluginId}' successfully updated.`);
      }
    }
  }
}

async function preparePlugins(siteInfo) {
  createPluginsFolder();

  const pluginsInFolder = readPluginsFromFolder();

  await verifyPlugins(pluginsInFolder, siteInfo.plugins);
}

export async function initializePlugins(siteInfo) {
  if (!browser) {
    await preparePlugins(siteInfo);
  }

  const pluginsInfo = siteInfo.plugins;

  if (browser) {
    Object.keys(pluginsInfo).forEach((pluginId) => {
      plugins[pluginId] = pluginsInfo[pluginId];
    });
  }

  await loadPlugins();
  await enablePlugins();
}

async function loadPlugins() {
  for (const pluginId of Object.keys(plugins)) {
    const plugin = plugins[pluginId];

    if (browser) {
      plugin.module = await import(
        /* @vite-ignore */ `${base}/plugins/${pluginId}/resources/plugin-ui/client/client.mjs`
      );
    } else {
      const pluginFolder = path.join(pluginsFolder, pluginId);

      const mainPath = path.join(pluginFolder, "server", "server.mjs") + `?${Date.now()}`;

      const __filename = url.fileURLToPath(import.meta.url);

      const currentDir = path.dirname(__filename); // Directory of the current file
      const targetFile = path.resolve(currentDir, process.cwd()); // Absolute path of the target file

      const relativePath = path.relative(currentDir, targetFile);
      const levels = relativePath.split(path.sep).length;

      const upDirs = "../".repeat(levels); // Repeating '../' based on the number of levels

      plugin.module = await import(/* @vite-ignore */ upDirs + mainPath);
    }
  }

  for (const pluginId of Object.keys(plugins)) {
    const plugin = plugins[pluginId];

    if (plugin.module.onLoad !== undefined) {
      await plugin.module.onLoad(pano);
    }
  }
}

async function enablePlugins() {
  for (const pluginId of Object.keys(plugins)) {
    const plugin = plugins[pluginId];

    if (plugin.module.onEnable !== undefined) {
      await plugin.module.onEnable(pano);
    }
  }
}
