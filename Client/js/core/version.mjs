// Deep-School Version Management System
class VersionManager {
  constructor() {
    this.versionConfig = null;
    this.configPath = './version.config.json';
  }

  // バージョン設定を読み込み
  async loadVersionConfig() {
    try {
      const response = await fetch(this.configPath);
      if (!response.ok) {
        throw new Error(`Failed to load version config: ${response.status}`);
      }
      this.versionConfig = await response.json();
      return this.versionConfig;
    } catch (error) {
      console.error('Version config load error:', error);
      // フォールバック用のデフォルト設定
      this.versionConfig = {
        deepSchoolFamily: {
          version: "25C0101",
          status: "stable",
          lastUpdated: "2025-01-01",
          description: "Deep-School Family Software - Initial release"
        },
        deepSchoolClient: {
          version: "1.0.1",
          status: "stable",
          cycle: 1,
          release: 0,
          revision: 1,
          lastUpdated: "2025-01-01",
          description: "Deep-School Client - Initial stable release"
        },
        deepSchoolServer: {
          version: "1.0.1",
          status: "stable",
          cycle: 1,
          release: 0,
          revision: 1,
          lastUpdated: "2025-01-01",
          description: "Deep-School Server - Initial stable release"
        },
        workMaker: {
          version: "1.0.1",
          status: "stable",
          cycle: 1,
          release: 0,
          revision: 1,
          lastUpdated: "2025-01-01",
          description: "Work-Maker - Initial stable release"
        },
        toasterMachine: {
          version: "1.0.1",
          cycle: 1,
          release: 0,
          revision: 1,
          lastUpdated: "2025-01-01",
          description: "Toaster-Machine - Initial stable release"
        }
      };
      return this.versionConfig;
    }
  }

  // バージョン情報を取得
  getVersion(component = 'all') {
    if (!this.versionConfig) {
      return { error: 'Version config not loaded' };
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
      return { error: `Unknown component: ${component}` };
    }

    return this.versionConfig[configKey];
  }

  // バージョン情報を表示用にフォーマット
  formatVersion(component = 'all') {
    const version = this.getVersion(component);
    
    if (version.error) {
      return `Error: ${version.error}`;
    }

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
      
      output += '=== Release Schedule ===\n';
      output += `Next Cycle Update: ${version.releaseSchedule?.nextCycleUpdate || 'Not specified'}\n`;
      
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
      return { error: 'Version config not loaded' };
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
}

export const versionManager = new VersionManager(); 