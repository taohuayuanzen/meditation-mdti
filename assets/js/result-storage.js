/**
 * 冥想星球 SBTI 结果快照公共存储脚本
 *
 * 负责：
 * - 统一结果快照版本与存储 key
 * - 提供当前会话结果与最近一次结果的安全读写
 * - 提供结果快照结构校验与异常降级
 */
(function initResultStorage(global) {
  const RESULT_SNAPSHOT_VERSION = 1;
  const CURRENT_RESULT_STORAGE_KEY = 'meditation-planet-sbti-current-result';
  const LATEST_RESULT_STORAGE_KEY = 'meditation-planet-sbti-latest-result';

  /**
   * 获取可用浏览器存储对象。
   * @param {'sessionStorage' | 'localStorage'} storageName 存储名称
   * @returns {Storage | null} 可用存储对象
   */
  function getBrowserStorage(storageName) {
    try {
      return global[storageName] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 判断结果快照是否满足正式结果页读取要求。
   * @param {object} snapshot 结果快照
   * @returns {boolean} 是否有效
   */
  function isValidResultSnapshot(snapshot) {
    return Boolean(
      snapshot &&
        snapshot.version === RESULT_SNAPSHOT_VERSION &&
        snapshot.finalType?.code &&
        snapshot.finalType?.displayName &&
        snapshot.finalType?.intro &&
        snapshot.finalType?.desc &&
        snapshot.mode &&
        snapshot.badge &&
        snapshot.levels
    );
  }

  /**
   * 读取原始存储内容。
   * @param {Storage | null} storage 存储对象
   * @param {string} storageKey 存储 key
   * @returns {string | null} 原始字符串
   */
  function readRawSnapshot(storage, storageKey) {
    if (!storage) {
      return null;
    }

    try {
      return storage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  /**
   * 清理指定存储层中的结果快照。
   * @param {Storage | null} storage 存储对象
   * @param {string} storageKey 存储 key
   * @returns {boolean} 是否执行成功
   */
  function clearSnapshotFromStorage(storage, storageKey) {
    if (!storage) {
      return false;
    }

    try {
      storage.removeItem(storageKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 读取并校验指定存储层中的结果快照。
   * @param {Storage | null} storage 存储对象
   * @param {string} storageKey 存储 key
   * @returns {object | null} 有效结果快照
   */
  function readSnapshotFromStorage(storage, storageKey) {
    const rawSnapshot = readRawSnapshot(storage, storageKey);
    if (!rawSnapshot) {
      return null;
    }

    try {
      const parsedSnapshot = JSON.parse(rawSnapshot);
      if (isValidResultSnapshot(parsedSnapshot)) {
        return parsedSnapshot;
      }
    } catch (error) {
      // 非法 JSON 按坏缓存处理，避免后续页面重复报错。
    }

    clearSnapshotFromStorage(storage, storageKey);
    return null;
  }

  /**
   * 将结果快照写入指定存储层。
   * @param {Storage | null} storage 存储对象
   * @param {string} storageKey 存储 key
   * @param {object} snapshot 结果快照
   * @returns {boolean} 是否写入成功
   */
  function writeSnapshotToStorage(storage, storageKey, snapshot) {
    if (!storage || !isValidResultSnapshot(snapshot)) {
      return false;
    }

    try {
      storage.setItem(storageKey, JSON.stringify(snapshot));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 读取当前会话结果快照。
   * @returns {object | null} 当前会话结果
   */
  function readCurrentResultSnapshot() {
    return readSnapshotFromStorage(
      getBrowserStorage('sessionStorage'),
      CURRENT_RESULT_STORAGE_KEY
    );
  }

  /**
   * 读取最近一次结果快照。
   * @returns {object | null} 最近一次结果
   */
  function readLatestResultSnapshot() {
    return readSnapshotFromStorage(
      getBrowserStorage('localStorage'),
      LATEST_RESULT_STORAGE_KEY
    );
  }

  /**
   * 按正式页面优先级读取结果快照。
   * @returns {object | null} 优先结果快照
   */
  function readPreferredResultSnapshot() {
    return readCurrentResultSnapshot() || readLatestResultSnapshot();
  }

  /**
   * 写入当前会话结果快照。
   * @param {object} snapshot 结果快照
   * @returns {boolean} 是否写入成功
   */
  function writeCurrentResultSnapshot(snapshot) {
    return writeSnapshotToStorage(
      getBrowserStorage('sessionStorage'),
      CURRENT_RESULT_STORAGE_KEY,
      snapshot
    );
  }

  /**
   * 写入最近一次结果快照。
   * @param {object} snapshot 结果快照
   * @returns {boolean} 是否写入成功
   */
  function writeLatestResultSnapshot(snapshot) {
    return writeSnapshotToStorage(
      getBrowserStorage('localStorage'),
      LATEST_RESULT_STORAGE_KEY,
      snapshot
    );
  }

  /**
   * 清理当前会话结果快照。
   * @returns {boolean} 是否清理成功
   */
  function clearCurrentResultSnapshot() {
    return clearSnapshotFromStorage(
      getBrowserStorage('sessionStorage'),
      CURRENT_RESULT_STORAGE_KEY
    );
  }

  global.MEDITATION_PLANET_RESULT_STORAGE = {
    RESULT_SNAPSHOT_VERSION,
    CURRENT_RESULT_STORAGE_KEY,
    LATEST_RESULT_STORAGE_KEY,
    isValidResultSnapshot,
    readCurrentResultSnapshot,
    readLatestResultSnapshot,
    readPreferredResultSnapshot,
    writeCurrentResultSnapshot,
    writeLatestResultSnapshot,
    clearCurrentResultSnapshot
  };
})(window);
