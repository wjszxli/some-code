module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.spec.ts'],  // 测试文件匹配规则
    collectCoverage: true,         // 开启覆盖率统计
    coverageDirectory: 'coverage', // 覆盖率报告目录
  };