<template>
  <div class="security-policy-config">
    <!-- 密码安全策略 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">密码安全策略</span>
      </template>
      <el-form label-width="180px">
        <el-form-item label="密码最小长度">
          <el-input-number v-model="security.passwordMinLength" :min="6" :max="32" />
          <span style="margin-left: 10px">字符</span>
        </el-form-item>
        <el-form-item label="复杂度要求">
          <el-checkbox-group v-model="security.passwordComplexity">
            <el-checkbox label="number">包含数字</el-checkbox>
            <el-checkbox label="letter">包含字母</el-checkbox>
            <el-checkbox label="symbol">包含特殊符号</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="密码过期周期">
          <el-input-number v-model="security.passwordExpireDays" :min="30" :max="365" />
          <span style="margin-left: 10px">天</span>
        </el-form-item>
        <el-form-item label="首次登录强制改密">
          <el-switch v-model="security.forceChangeFirstLogin" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 登录防护配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">登录防护配置</span>
      </template>
      <el-form label-width="180px">
        <el-form-item label="错误密码锁定次数">
          <el-input-number v-model="security.lockThreshold" :min="3" :max="10" />
          <span style="margin-left: 10px">次</span>
        </el-form-item>
        <el-form-item label="锁定时长">
          <el-input-number v-model="security.lockDuration" :min="5" :max="120" />
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
        <el-form-item label="IP白名单">
          <el-switch v-model="security.ipWhitelistEnabled" />
        </el-form-item>
        <el-form-item label="白名单IP列表" v-if="security.ipWhitelistEnabled">
          <el-input
              v-model="security.ipWhitelist"
              type="textarea"
              :rows="3"
              placeholder="每行一个IP，例：192.168.1.100"
          />
        </el-form-item>
        <el-form-item label="内网单点登录">
          <el-switch v-model="security.ssoEnabled" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 会话管理配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">会话管理配置</span>
      </template>
      <el-form label-width="180px">
        <el-form-item label="无操作自动超时">
          <el-input-number v-model="security.sessionTimeout" :min="5" :max="480" />
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
        <el-form-item label="单账号最大登录设备数">
          <el-input-number v-model="security.maxDevices" :min="1" :max="5" />
          <span style="margin-left: 10px">台</span>
        </el-form-item>
        <el-form-item label="强制下线功能">
          <el-switch v-model="security.forceLogoutEnabled" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据安全配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">数据安全配置</span>
      </template>
      <el-form label-width="180px">
        <el-form-item label="敏感数据脱敏">
          <el-switch v-model="security.dataMasking" />
        </el-form-item>
        <el-form-item label="操作日志保留周期">
          <el-select v-model="security.logRetentionDays" style="width: 200px">
            <el-option label="90天" :value="90" />
            <el-option label="180天" :value="180" />
            <el-option label="365天" :value="365" />
            <el-option label="永久" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="自动退出清理缓存">
          <el-switch v-model="security.autoClearCache" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const security = reactive({
  passwordMinLength: 8,
  passwordComplexity: ['number', 'letter'],
  passwordExpireDays: 90,
  forceChangeFirstLogin: true,
  lockThreshold: 5,
  lockDuration: 30,
  ipWhitelistEnabled: false,
  ipWhitelist: '',
  ssoEnabled: true,
  sessionTimeout: 30,
  maxDevices: 3,
  forceLogoutEnabled: true,
  dataMasking: true,
  logRetentionDays: 365,
  autoClearCache: true
})
</script>

<style lang="scss" scoped>
.security-policy-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;

  .config-card {
    border-radius: 8px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
