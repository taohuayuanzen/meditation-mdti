/**
 * 冥想星球 SBTI 首页最近结果入口脚本
 *
 * 负责：
 * - 读取最近一次结果缓存
 * - 控制首页入口显隐
 */
const recentResultStorage = window.MEDITATION_PLANET_RESULT_STORAGE;
const recentResultLink = document.getElementById('recentResultLink');

initRecentResultLink();

/**
 * 初始化最近结果入口。
 */
function initRecentResultLink() {
  if (!recentResultStorage || !recentResultLink) {
    return;
  }

  if (!recentResultStorage.readLatestResultSnapshot()) {
    return;
  }

  recentResultLink.classList.remove('hidden');
}
