<template>
  <div class="base-platform-config">
    <!-- 系统基础信息 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">系统基础信息</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="企业名称">
          <el-input v-model="config.companyName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="系统LOGO">
          <el-upload
              class="logo-uploader"
              action="#"
              :auto-upload="false"
              :limit="1"
          >
            <img v-if="config.logo" :src="config.logo" class="logo" />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">建议尺寸：200x60px，支持PNG/JPG格式</div>
        </el-form-item>
        <el-form-item label="页脚版权信息">
          <el-input v-model="config.copyright" placeholder="© 2026 企业名称 版权所有" />
        </el-form-item>
        <el-form-item label="系统版本号">
          <el-input v-model="config.version" placeholder="V1.0.0" disabled />
        </el-form-item>
        <el-form-item label="默认语言">
          <el-select v-model="config.defaultLanguage" style="width: 200px">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 前台界面配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">前台界面配置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="默认主题色">
          <el-color-picker v-model="config.themeColor" />
        </el-form-item>
        <el-form-item label="菜单布局">
          <el-radio-group v-model="config.menuLayout">
            <el-radio label="sidebar">侧边栏</el-radio>
            <el-radio label="top">顶部菜单</el-radio>
            <el-radio label="mix">混合模式</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="列表默认条数">
          <el-input-number v-model="config.defaultPageSize" :min="10" :max="100" :step="10" />
          <span style="margin-left: 10px">条/页</span>
        </el-form-item>
        <el-form-item label="全局水印">
          <el-switch v-model="config.watermarkEnabled" />
        </el-form-item>
        <el-form-item label="工作台默认布局">
          <el-select v-model="config.workbenchLayout" style="width: 200px">
            <el-option label="卡片式" value="card" />
            <el-option label="列表式" value="list" />
            <el-option label="看板式" value="board" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 附件存储配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">附件存储配置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="单文件上传上限">
          <el-input-number v-model="config.maxFileSize" :min="10" :max="500" />
          <span style="margin-left: 10px">MB</span>
        </el-form-item>
        <el-form-item label="总附件大小限制">
          <el-input-number v-model="config.maxTotalSize" :min="100" :max="10000" />
          <span style="margin-left: 10px">MB</span>
        </el-form-item>
        <el-form-item label="允许上传格式">
          <el-checkbox-group v-model="config.allowedFormats">
            <el-checkbox label="doc">Word</el-checkbox>
            <el-checkbox label="xls">Excel</el-checkbox>
            <el-checkbox label="pdf">PDF</el-checkbox>
            <el-checkbox label="jpg">图片</el-checkbox>
            <el-checkbox label="mp4">视频</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="存储路径">
          <el-input v-model="config.storagePath" placeholder="/data/attachments" disabled />
          <div class="form-tip">内网本地存储路径，不可修改</div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 终端适配配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">终端适配配置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="PC端自适应">
          <el-switch v-model="config.pcAdaptive" />
        </el-form-item>
        <el-form-item label="移动端极简模式">
          <el-switch v-model="config.mobileLiteMode" />
        </el-form-item>
        <el-form-item label="第三方客户端登录">
          <el-switch v-model="config.thirdPartyLogin" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const config = reactive({
  companyName: '某某科技有限公司',
  logo: '',
  copyright: '© 2026 某某科技有限公司 版权所有',
  version: 'V2.0.0',
  defaultLanguage: 'zh-CN',
  themeColor: '#409EFF',
  menuLayout: 'sidebar',
  defaultPageSize: 20,
  watermarkEnabled: true,
  workbenchLayout: 'card',
  maxFileSize: 50,
  maxTotalSize: 500,
  allowedFormats: ['doc', 'xls', 'pdf', 'jpg'],
  storagePath: '/data/attachments',
  pcAdaptive: true,
  mobileLiteMode: false,
  thirdPartyLogin: false
})
</script>

<style lang="scss" scoped>
.base-platform-config {
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

    .logo-uploader {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      width: 200px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;

      .logo {
        width: 200px;
        height: 60px;
        object-fit: contain;
      }

      .logo-uploader-icon {
        font-size: 28px;
        color: #8c939d;
      }
    }

    .form-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}
</style>
