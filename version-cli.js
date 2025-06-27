#!/usr/bin/env node

/**
 * Deep-School Version Management CLI
 * 
 * Usage:
 *   node version-cli.js [command] [options]
 * 
 * Commands:
 *   all                    - Show all version information
 *   get <component>        - Show specific component version
 *   list                   - List available components
 *   check                  - Check for updates
 *   compare <v1> <v2>      - Compare two versions
 *   help                   - Show help information
 */

const fs = require('fs');
const path = require('path');

class VersionCLI {
  constructor() {
    this.configPath = path.join(__dirname, 'version.config.json');
    this.versionConfig = null;
  }

  // バージョン設定を読み込み
  loadVersionConfig() {
    try {
      if (!fs.existsSync(this.configPath)) {
        console.error('Error: version.config.json not found');
        process.exit(1);
      }
      
      const configData = fs.readFileSync(this.configPath, 'utf8');
      this.versionConfig = JSON.parse(configData);
      return this.versionConfig;
    } catch (error) {
      console.error('Error loading version config:', error.message);
      process.exit(1);
    }
  }

  // バージョン情報を取得
  getVersion(component = 'all') {
    if (!this.versionConfig) {
      this.loadVersionConfig();
    }

    if (component === 'all') {
      return this.versionConfig;
    }

    const componentMap = {
      'family': 'deepSchoolFamily',
      'client': 'deepSchoolClient',
      'server': 'deepSchoolServer',
      'workmaker': 'workMaker',
      'toaster': 'toasterMachine'
    };

    const configKey = componentMap[component.toLowerCase()];
    if (!configKey || !this.versionConfig[configKey]) {
      throw new Error(`Unknown component: ${component}`);
    }

    return this.versionConfig[configKey];
  }

  // バージョン情報を表示用にフォーマット
  formatVersion(component = 'all') {
    try {
      const version = this.getVersion(component);
      
      if (component === 'all') {
        let output = '=== Deep-School Family Software Versions ===\n\n';
        
        // Deep-School Family
        const family = version.deepSchoolFamily;
        output += `🌐 Deep-School Family: ${family.version} (${family.status})\n`;
        output += `   Last Updated: ${family.lastUpdated}\n`;
        output += `   Description: ${family.description}\n\n`;
        
        // Deep-School Client
        const client = version.deepSchoolClient;
        output += `💻 Deep-School Client: v${client.version} (${client.status})\n`;
        output += `   Cycle: ${client.cycle}, Release: ${client.release}, Revision: ${client.revision}\n`;
        output += `   Last Updated: ${client.lastUpdated}\n`;
        output += `   Description: ${client.description}\n\n`;
        
        // Deep-School Server
        const server = version.deepSchoolServer;
        output += `🖥️  Deep-School Server: v${server.version} (${server.status})\n`;
        output += `   Cycle: ${server.cycle}, Release: ${server.release}, Revision: ${server.revision}\n`;
        output += `   Last Updated: ${server.lastUpdated}\n`;
        output += `   Description: ${server.description}\n\n`;
        
        // Work-Maker
        const workmaker = version.workMaker;
        output += `🔧 Work-Maker: v${workmaker.version} (${workmaker.status})\n`;
        output += `   Cycle: ${workmaker.cycle}, Release: ${workmaker.release}, Revision: ${workmaker.revision}\n`;
        output += `   Last Updated: ${workmaker.lastUpdated}\n`;
        output += `   Description: ${workmaker.description}\n\n`;
        
        // Toaster-Machine
        const toaster = version.toasterMachine;
        output += `🍞 Toaster-Machine: v${toaster.version}\n`;
        output += `   Cycle: ${toaster.cycle}, Release: ${toaster.release}, Revision: ${toaster.revision}\n`;
        output += `   Last Updated: ${toaster.lastUpdated}\n`;
        output += `   Description: ${toaster.description}\n\n`;
        
        if (version.releaseSchedule) {
          output += '=== Release Schedule ===\n';
          output += `Next Cycle Update: ${version.releaseSchedule.nextCycleUpdate || 'Not specified'}\n`;
        }
        
        return output;
      } else {
        const comp = version;
        let output = `=== ${component.toUpperCase()} Version ===\n\n`;
        
        if (comp.version) {
          output += `Version: ${comp.version}\n`;
        }
        if (comp.status) {
          output += `Status: ${comp.status}\n`;
        }
        if (comp.cycle !== undefined) {
          output += `Cycle: ${comp.cycle}\n`;
        }
        if (comp.release !== undefined) {
          output += `Release: ${comp.release}\n`;
        }
        if (comp.revision !== undefined) {
          output += `Revision: ${comp.revision}\n`;
        }
        output += `Last Updated: ${comp.lastUpdated}\n`;
        output += `Description: ${comp.description}\n`;
        
        return output;
      }
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  // バージョン比較
  compareVersions(version1, version2) {
    const parseVersion = (version) => {
      if (typeof version === 'string') {
        const parts = version.replace('v', '').split('.');
        return {
          cycle: parseInt(parts[0]) || 0,
          release: parseInt(parts[1]) || 0,
          revision: parseInt(parts[2]) || 0
        };
      }
      return version;
    };

    const v1 = parseVersion(version1);
    const v2 = parseVersion(version2);

    if (v1.cycle !== v2.cycle) {
      return v1.cycle > v2.cycle ? 1 : -1;
    }
    if (v1.release !== v2.release) {
      return v1.release > v2.release ? 1 : -1;
    }
    if (v1.revision !== v2.revision) {
      return v1.revision > v2.revision ? 1 : -1;
    }
    return 0;
  }

  // アップデートチェック
  checkForUpdates() {
    if (!this.versionConfig) {
      this.loadVersionConfig();
    }

    const currentClient = this.versionConfig.deepSchoolClient;
    const currentServer = this.versionConfig.deepSchoolServer;
    const currentWorkMaker = this.versionConfig.workMaker;
    const currentToaster = this.versionConfig.toasterMachine;

    // 実際のアップデートチェックロジックはここに実装
    // 現在はダミーデータを返す
    return {
      client: { hasUpdate: false, current: currentClient.version, latest: currentClient.version },
      server: { hasUpdate: false, current: currentServer.version, latest: currentServer.version },
      workMaker: { hasUpdate: false, current: workMaker.version, latest: workMaker.version },
      toaster: { hasUpdate: false, current: currentToaster.version, latest: currentToaster.version }
    };
  }

  // ヘルプ表示
  showHelp() {
    const help = `
Deep-School Version Management CLI

Usage:
  node version-cli.js [command] [options]

Commands:
  all                    - Show all version information
  get <component>        - Show specific component version
  list                   - List available components
  check                  - Check for updates
  compare <v1> <v2>      - Compare two versions
  help                   - Show this help information

Available components: family, client, server, workmaker, toaster

Examples:
  node version-cli.js all
  node version-cli.js get client
  node version-cli.js compare 1.0.1 1.0.2
  node version-cli.js check

Version Format:
  Deep-School: v.CYCLE.RELEASE.REVISION(.STATUS)
  Toaster-Machine: v.CYCLE.RELEASE.REVISION
  Family Software: YEAR(FIRST-CODE-RELEASED-YEAR)C[BUILD][RELEASE](.STATUS)

Examples:
  Deep-School Client: v1.3.2.beta
  Toaster-Machine: v1.3.2
  Family Software: 25C1205.nightly
    `;
    console.log(help);
  }

  // メイン実行関数
  run() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === 'help') {
      this.showHelp();
      return;
    }

    try {
      switch (command) {
        case 'all':
          console.log(this.formatVersion('all'));
          break;

        case 'get':
          const component = args[1] || 'client';
          console.log(this.formatVersion(component));
          break;

        case 'list':
          const components = ['family', 'client', 'server', 'workmaker', 'toaster'];
          console.log('Available components:', components.join(', '));
          break;

        case 'check':
          const updates = this.checkForUpdates();
          console.log('Update check results:');
          console.log(JSON.stringify(updates, null, 2));
          break;

        case 'compare':
          const version1 = args[1];
          const version2 = args[2];
          if (!version1 || !version2) {
            console.error('Error: Two versions required for comparison');
            process.exit(1);
          }
          const result = this.compareVersions(version1, version2);
          const comparison = result === 1 ? 'newer' : result === -1 ? 'older' : 'same';
          console.log(`Version comparison: ${version1} is ${comparison} than ${version2}`);
          break;

        default:
          console.error(`Unknown command: ${command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
}

// CLI実行
if (require.main === module) {
  const cli = new VersionCLI();
  cli.run();
}

module.exports = VersionCLI; 