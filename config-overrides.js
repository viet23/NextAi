module.exports = function override(config, env) {
  // tuỳ chỉnh webpack nếu cần

  return config;
};

module.exports.devServer = function (configFunction) {
  return function (proxy, allowedHost) {
    const config = configFunction(proxy, allowedHost);

    config.allowedHosts = "all"; // ✅ Sửa lỗi ở đây

    return config;
  };
};
