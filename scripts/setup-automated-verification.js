/**
 * 自动化验证环境设置脚本
 * 
 * 检查依赖并运行自动化验证
 */

const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');

class AutomationSetup {
  constructor() {
    this.hasChrome = false;
    this.hasPuppeteer = false;
  }

  checkChrome() {
    try {
      // 检查Chrome是否安装
      if (process.platform === 'win32') {
        execSync('where chrome', { stdio: 'ignore' });
      } else {
        execSync('which google-chrome || which chromium-browser', { stdio: 'ignore' });
      }
      this.hasChrome = true;
      console.log(chalk.green('✅ Chrome浏览器已安装'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ 未检测到Chrome浏览器'));
    }
  }

  checkPuppeteer() {
    try {
      require.resolve('puppeteer');
      this.hasPuppeteer = true;
      console.log(chalk.green('✅ Puppeteer已安装'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Puppeteer未安装'));
    }
  }

  async installPuppeteer() {
    console.log(chalk.blue('📦 安装Puppeteer...'));
    try {
      execSync('npm install puppeteer', { stdio: 'inherit' });
      console.log(chalk.green('✅ Puppeteer安装成功'));
      this.hasPuppeteer = true;
    } catch (error) {
      console.log(chalk.red('❌ Puppeteer安装失败'));
      throw error;
    }
  }

  async runQuickVerification(stage = null) {
    console.log(chalk.blue('🚀 运行快速API验证...'));
    
    try {
      const QuickVerifier = require('./quick-automated-verification');
      const verifier = new QuickVerifier();
      if (stage) {
        verifier.results.stage = stage;
      }
      const report = await verifier.run();
      return report;
    } catch (error) {
      console.log(chalk.red(`❌ 快速验证失败: ${error.message}`));
      throw error;
    }
  }

  async runFullVerification(stage = null) {
    console.log(chalk.blue('🚀 运行完整UI验证...'));
    
    try {
      const FullVerifier = require('./automated-button-verification');
      const verifier = new FullVerifier();
      if (stage) {
        verifier.stage = stage;
      }
      const report = await verifier.run();
      return report;
    } catch (error) {
      console.log(chalk.red(`❌ 完整验证失败: ${error.message}`));
      throw error;
    }
  }

  async setup() {
    console.log(chalk.blue('🔧 设置自动化验证环境...'));
    
    this.checkChrome();
    this.checkPuppeteer();
    
    // 如果没有Puppeteer，询问是否安装
    if (!this.hasPuppeteer) {
      console.log(chalk.yellow('\n💡 建议安装Puppeteer以支持完整的UI自动化验证'));
      console.log(chalk.gray('   快速验证只测试API，完整验证会测试UI交互'));
      
      // 自动安装Puppeteer
      try {
        await this.installPuppeteer();
      } catch (error) {
        console.log(chalk.yellow('⚠️ Puppeteer安装失败，将使用快速验证模式'));
      }
    }
  }

  async run(options = {}) {
    const { stage, mode } = options;
    
    await this.setup();
    
    console.log(chalk.blue('\n🎯 选择验证模式:'));
    
    if (mode === 'quick' || !this.hasPuppeteer) {
      console.log(chalk.blue('📊 使用快速API验证模式'));
      return await this.runQuickVerification(stage);
    } else if (mode === 'full' && this.hasPuppeteer) {
      console.log(chalk.blue('🖥️ 使用完整UI验证模式'));
      return await this.runFullVerification(stage);
    } else {
      // 默认先尝试快速验证
      console.log(chalk.blue('📊 先运行快速API验证...'));
      const quickReport = await this.runQuickVerification(stage);
      
      if (this.hasPuppeteer && quickReport.summary.successRate >= 70) {
        console.log(chalk.blue('\n🖥️ API验证通过，继续UI验证...'));
        const fullReport = await this.runFullVerification(stage);
        return { quick: quickReport, full: fullReport };
      } else {
        console.log(chalk.yellow('\n⚠️ API验证未完全通过，建议先修复API问题'));
        return { quick: quickReport };
      }
    }
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  const stageArg = args.find(arg => arg.startsWith('--stage='));
  if (stageArg) {
    options.stage = parseInt(stageArg.split('=')[1]);
  }
  
  if (args.includes('--quick')) {
    options.mode = 'quick';
  } else if (args.includes('--full')) {
    options.mode = 'full';
  }
  
  return options;
}

// 主函数
async function main() {
  console.log(chalk.blue('🤖 自动化按钮功能验证系统'));
  console.log(chalk.blue('=' * 40));
  
  const options = parseArgs();
  const setup = new AutomationSetup();
  
  try {
    const report = await setup.run(options);
    
    console.log(chalk.green('\n🎉 自动化验证完成！'));
    
    if (report.quick) {
      console.log(chalk.blue(`📊 API验证成功率: ${report.quick.summary.successRate}%`));
    }
    
    if (report.full) {
      console.log(chalk.blue(`🖥️ UI验证成功率: ${report.full.summary.successRate}%`));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ 自动化验证失败:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutomationSetup;