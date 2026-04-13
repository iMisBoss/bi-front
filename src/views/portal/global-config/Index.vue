<template>
  <div class="global-config">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>门户中心</el-breadcrumb-item>
      <el-breadcrumb-item>基础配置</el-breadcrumb-item>
      <el-breadcrumb-item>全局配置</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 顶部操作栏（固定） -->
    <div class="top-actions">
      <el-button type="primary" @click="handleSave" :loading="saving">
        <el-icon><Check /></el-icon>保存配置
      </el-button>
      <el-button @click="handleResetDefault">
        <el-icon><RefreshLeft /></el-icon>重置默认
      </el-button>
      <el-button @click="handleClearCache">
        <el-icon><Delete /></el-icon>清除缓存
      </el-button>
      <el-button @click="refreshData">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </div>

    <!-- 核心配置区（分模块折叠式布局） -->
    <el-card class="config-card" shadow="never">
      <el-collapse v-model="activeModules" class="config-collapse">
        <!-- 模块1：全局样式配置（默认展开） -->
        <el-collapse-item name="style" title="全局样式配置">
          <template #title>
            <div class="module-title">
              <span>全局样式配置</span>
              <el-tooltip content="统一所有门户的外观样式，贴合企业品牌规范" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form :model="styleConfig" label-width="140px" class="config-form">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="企业LOGO" required>
                  <el-upload
                      class="logo-uploader"
                      action="#"
                      :auto-upload="false"
                      :show-file-list="false"
                      :on-change="handleLogoUpload"
                      accept=".jpg,.png"
                  >
                    <img v-if="styleConfig.logo" :src="styleConfig.logo" class="logo-preview" />
                    <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div class="form-tip">支持JPG/PNG，建议尺寸200*60px，大小2MB以内</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主题色" required>
                  <el-color-picker v-model="styleConfig.primaryColor" show-alpha />
                  <div class="form-tip">门户主色调，应用于按钮、标签、高亮区域</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="辅助色">
                  <el-color-picker v-model="styleConfig.secondaryColor" show-alpha />
                  <div class="form-tip">门户辅助色调，应用于提示、次要按钮</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="字体配置">
                  <el-select v-model="styleConfig.fontFamily" placeholder="请选择字体" style="width: 100%">
                    <el-option label="微软雅黑" value="Microsoft YaHei" />
                    <el-option label="宋体" value="SimSun" />
                    <el-option label="黑体" value="SimHei" />
                    <el-option label="Arial" value="Arial" />
                    <el-option label="自定义" value="custom" />
                  </el-select>
                  <el-input
                      v-if="styleConfig.fontFamily === 'custom'"
                      v-model="styleConfig.customFont"
                      placeholder="请输入自定义字体名称"
                      style="margin-top: 8px"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="布局规范" required>
                  <el-radio-group v-model="styleConfig.layoutStyle">
                    <el-radio value="card">卡片式</el-radio>
                    <el-radio value="simple">极简式</el-radio>
                    <el-radio value="column">分栏式</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="组件默认样式" required>
                  <el-radio-group v-model="styleConfig.componentStyle">
                    <el-radio value="rounded">有圆角+阴影</el-radio>
                    <el-radio value="flat">无圆角+无阴影</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="顶部Banner">
                  <el-upload
                      class="banner-uploader"
                      action="#"
                      :auto-upload="false"
                      :show-file-list="false"
                      :on-change="handleBannerUpload"
                      accept=".jpg,.png"
                  >
                    <img v-if="styleConfig.banner" :src="styleConfig.banner" class="banner-preview" />
                    <el-button size="small" type="primary">上传Banner</el-button>
                  </el-upload>
                  <div class="form-tip">支持JPG/PNG，大小5MB以内</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Banner高度">
                  <el-input-number
                      v-model="styleConfig.bannerHeight"
                      :min="100"
                      :max="300"
                      controls-position="right"
                      style="width: 100%"
                  />
                  <div class="form-tip">单位：像素，范围100-300px</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>

        <!-- 模块2：基础参数配置（默认展开） -->
        <el-collapse-item name="basic" title="基础参数配置">
          <template #title>
            <div class="module-title">
              <span>基础参数配置</span>
              <el-tooltip content="配置门户的基础运行参数，优化加载速度与缓存策略" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form :model="basicConfig" label-width="140px" class="config-form">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="默认加载方式" required>
                  <el-radio-group v-model="basicConfig.loadMode">
                    <el-radio value="lazy">懒加载</el-radio>
                    <el-radio value="immediate">立即加载</el-radio>
                  </el-radio-group>
                  <div class="form-tip">懒加载：滚动到区域再加载组件，提升首屏速度</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="组件缓存时间" required>
                  <el-input-number
                      v-model="basicConfig.cacheTime"
                      :min="0"
                      :max="120"
                      controls-position="right"
                      style="width: 100%"
                  />
                  <div class="form-tip">单位：分钟，0表示不缓存，范围0-120分钟</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="门户默认分类" required>
                  <el-select v-model="basicConfig.defaultCategory" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                  <div class="form-tip">新增门户时默认选中的分类</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最大门户数量">
                  <el-input-number
                      v-model="basicConfig.maxPortals"
                      :min="0"
                      controls-position="right"
                      style="width: 100%"
                  />
                  <div class="form-tip">0表示无限制，达到上限后禁止新增门户</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="预览默认比例" required>
                  <el-select v-model="basicConfig.previewZoom" placeholder="请选择" style="width: 100%">
                    <el-option label="80%" :value="80" />
                    <el-option label="100%" :value="100" />
                    <el-option label="120%" :value="120" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="自动保存间隔" required>
                  <el-input-number
                      v-model="basicConfig.autoSaveInterval"
                      :min="30"
                      :max="300"
                      controls-position="right"
                      style="width: 100%"
                  />
                  <div class="form-tip">单位：秒，范围30-300秒，默认60秒</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>

        <!-- 模块3：安全配置（默认展开） -->
        <el-collapse-item name="security" title="安全配置">
          <template #title>
            <div class="module-title">
              <span>安全配置</span>
              <el-tooltip content="管控自定义代码与第三方嵌入的安全风险，保障系统稳定" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form :model="securityConfig" label-width="140px" class="config-form">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="自定义代码管控" required>
                  <el-radio-group v-model="securityConfig.codeSandbox">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：代码运行在安全沙箱中，限制危险操作</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="跨域访问限制" required>
                  <el-radio-group v-model="securityConfig.corsLimit">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：禁止访问未授权的跨域接口</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="危险组件管控">
                  <el-checkbox-group v-model="securityConfig.dangerousComponents">
                    <el-checkbox value="html">自定义HTML</el-checkbox>
                    <el-checkbox value="iframe">iframe嵌入</el-checkbox>
                    <el-checkbox value="js">自定义JS</el-checkbox>
                  </el-checkbox-group>
                  <div class="form-tip">选中后，对应组件在设计器中隐藏</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="敏感数据隐藏" required>
                  <el-radio-group v-model="securityConfig.hideSensitiveData">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：手机号、身份证等敏感数据自动隐藏</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="代码审计开关" required>
                  <el-radio-group v-model="securityConfig.codeAudit">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：自动检测XSS、注入等安全风险</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="授权接口白名单">
                  <el-input
                      v-model="securityConfig.apiWhitelist"
                      type="textarea"
                      :rows="3"
                      placeholder="每行一个URL地址，如：https://api.example.com"
                  />
                  <div class="form-tip">仅白名单内的接口可被自定义代码访问</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>

        <!-- 模块4：联动配置（默认折叠） -->
        <el-collapse-item name="linkage" title="联动配置">
          <template #title>
            <div class="module-title">
              <span>联动配置</span>
              <el-tooltip content="配置门户与其他系统模块的联动规则，确保数据同步" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form :model="linkageConfig" label-width="140px" class="config-form">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="门户与流程联动" required>
                  <el-radio-group v-model="linkageConfig.flowLinkage">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：待办/已办组件实时同步流程中心数据</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="门户与表单联动" required>
                  <el-radio-group v-model="linkageConfig.formLinkage">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：表单数据组件实时同步表单中心数据</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="用户信息同步" required>
                  <el-radio-group v-model="linkageConfig.userSync">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：个人信息组件实时同步用户管理中心数据</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="分类变更联动" required>
                  <el-radio-group v-model="linkageConfig.categorySync">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：分类修改后，关联门户自动同步</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="规则生效延迟">
                  <el-input-number
                      v-model="linkageConfig.ruleDelay"
                      :min="0"
                      :max="60"
                      controls-position="right"
                      style="width: 100%"
                  />
                  <div class="form-tip">单位：秒，0表示实时生效，范围0-60秒</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>

        <!-- 模块5：日志配置（默认折叠） -->
        <el-collapse-item name="log" title="日志配置">
          <template #title>
            <div class="module-title">
              <span>日志配置</span>
              <el-tooltip content="配置门户操作日志记录规则，满足合规审计需求" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form :model="logConfig" label-width="140px" class="config-form">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="操作日志记录" required>
                  <el-radio-group v-model="logConfig.operationLog">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：记录所有门户相关操作日志</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="日志保留时间">
                  <el-input-number
                      v-model="logConfig.logRetention"
                      :min="0"
                      controls-position="right"
                      style="width: 100%"
                  />
                  <div class="form-tip">单位：天，0表示永久保留，默认90天</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="日志导出权限" required>
                  <el-radio-group v-model="logConfig.logExportPermission">
                    <el-radio value="super_admin">仅超级管理员</el-radio>
                    <el-radio value="admin_plus">超级管理员+门户管理员</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="异常日志提醒" required>
                  <el-radio-group v-model="logConfig.exceptionAlert">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：出现异常时向超级管理员发送提醒</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>

        <!-- 模块6：扩展配置（默认折叠） -->
        <el-collapse-item name="extension" title="扩展配置">
          <template #title>
            <div class="module-title">
              <span>扩展配置</span>
              <el-tooltip content="预留扩展配置项，适配未来多端、多行业需求" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form :model="extensionConfig" label-width="140px" class="config-form">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="移动端适配" required>
                  <el-radio-group v-model="extensionConfig.mobileAdapt">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：所有门户自动适配移动端</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="第三方集成开关" required>
                  <el-radio-group v-model="extensionConfig.thirdPartyIntegration">
                    <el-radio value="enabled">开启</el-radio>
                    <el-radio value="disabled">关闭</el-radio>
                  </el-radio-group>
                  <div class="form-tip">开启：允许嵌入第三方系统（CRM、ERP等）</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="自定义版权信息">
                  <el-input
                      v-model="extensionConfig.copyright"
                      placeholder="如：2026 某某公司 版权所有"
                      maxlength="50"
                      show-word-limit
                  />
                  <div class="form-tip">所有门户底部同步显示该版权信息</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="门户加载提示">
                  <el-input
                      v-model="extensionConfig.loadingTip"
                      placeholder="如：加载中，请稍候..."
                      maxlength="30"
                      show-word-limit
                  />
                  <div class="form-tip">门户加载时显示的提示文案</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 配置说明区（固定在底部） -->
    <div class="config-tips">
      <el-alert type="info" :closable="false">
        <template #default>
          <div class="tips-content">
            <p>• 所有配置保存后实时生效，无需重启系统</p>
            <p>• 点击「重置默认」将恢复所有配置为系统默认值，不可恢复，请谨慎操作</p>
            <p>• 清除缓存后，所有门户将重新加载配置，可能影响短暂访问体验</p>
          </div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, RefreshLeft, Delete, Refresh, QuestionFilled, Plus } from '@element-plus/icons-vue'

// 状态管理
const saving = ref(false)
const activeModules = ref(['style', 'basic', 'security'])

// 配置数据
const styleConfig = reactive({
  logo: '',
  primaryColor: '#409eff',
  secondaryColor: '#67c23a',
  fontFamily: 'Microsoft YaHei',
  customFont: '',
  layoutStyle: 'card',
  componentStyle: 'rounded',
  banner: '',
  bannerHeight: 200
})

const basicConfig = reactive({
  loadMode: 'lazy',
  cacheTime: 30,
  defaultCategory: 'office',
  maxPortals: 0,
  previewZoom: 100,
  autoSaveInterval: 60
})

const securityConfig = reactive({
  codeSandbox: 'enabled',
  corsLimit: 'enabled',
  dangerousComponents: ['html', 'iframe', 'js'],
  hideSensitiveData: 'enabled',
  codeAudit: 'enabled',
  apiWhitelist: ''
})

const linkageConfig = reactive({
  flowLinkage: 'enabled',
  formLinkage: 'enabled',
  userSync: 'enabled',
  categorySync: 'enabled',
  ruleDelay: 0
})

const logConfig = reactive({
  operationLog: 'enabled',
  logRetention: 90,
  logExportPermission: 'super_admin',
  exceptionAlert: 'enabled'
})

const extensionConfig = reactive({
  mobileAdapt: 'disabled',
  thirdPartyIntegration: 'disabled',
  copyright: '',
  loadingTip: ''
})

// 选项数据
const categoryOptions = ref([
  { label: '办公门户', value: 'office' },
  { label: '数据门户', value: 'data' },
  { label: '管理门户', value: 'admin' }
])

// 事件处理
const handleLogoUpload = (file) => {
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('仅支持JPG/PNG格式')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    styleConfig.logo = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleBannerUpload = (file) => {
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  const isLt5M = file.raw.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('仅支持JPG/PNG格式')
    return
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    styleConfig.banner = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleSave = () => {
  // 校验必填项
  if (!styleConfig.logo) {
    ElMessage.error('请上传企业LOGO')
    return
  }
  if (!styleConfig.primaryColor) {
    ElMessage.error('请选择主题色')
    return
  }

  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('配置保存成功，已实时生效')
    // 记录操作日志
    console.log('保存全局配置')
  }, 800)
}

const handleResetDefault = () => {
  ElMessageBox.confirm(
      '确定要重置所有全局配置为系统默认值吗？此操作不可恢复，将覆盖所有已修改配置，请谨慎操作！',
      '重置确认',
      { type: 'error' }
  ).then(() => {
    resetToDefault()
    ElMessage.success('配置已重置为默认值，已实时生效')
  }).catch(() => {})
}

const handleClearCache = () => {
  ElMessageBox.confirm(
      '确定要清除所有门户缓存吗？清除后，所有门户将重新加载配置，可能影响短暂访问体验',
      '清除缓存确认',
      { type: 'warning' }
  ).then(() => {
    ElMessage.success('缓存清除成功')
  }).catch(() => {})
}

const refreshData = () => {
  ElMessage.success('刷新成功')
}

const resetToDefault = () => {
  Object.assign(styleConfig, {
    logo: '',
    primaryColor: '#409eff',
    secondaryColor: '#67c23a',
    fontFamily: 'Microsoft YaHei',
    customFont: '',
    layoutStyle: 'card',
    componentStyle: 'rounded',
    banner: '',
    bannerHeight: 200
  })

  Object.assign(basicConfig, {
    loadMode: 'lazy',
    cacheTime: 30,
    defaultCategory: 'office',
    maxPortals: 0,
    previewZoom: 100,
    autoSaveInterval: 60
  })

  Object.assign(securityConfig, {
    codeSandbox: 'enabled',
    corsLimit: 'enabled',
    dangerousComponents: ['html', 'iframe', 'js'],
    hideSensitiveData: 'enabled',
    codeAudit: 'enabled',
    apiWhitelist: ''
  })

  Object.assign(linkageConfig, {
    flowLinkage: 'enabled',
    formLinkage: 'enabled',
    userSync: 'enabled',
    categorySync: 'enabled',
    ruleDelay: 0
  })

  Object.assign(logConfig, {
    operationLog: 'enabled',
    logRetention: 90,
    logExportPermission: 'super_admin',
    exceptionAlert: 'enabled'
  })

  Object.assign(extensionConfig, {
    mobileAdapt: 'disabled',
    thirdPartyIntegration: 'disabled',
    copyright: '',
    loadingTip: ''
  })
}

onMounted(() => {
  // 加载配置数据
  console.log('加载全局配置')
})
</script>

<style scoped lang="scss">.global-config {
  padding: 16px;
  background: #f0f2f5;
  min-height: calc(100vh - 50px);
  padding-bottom: 120px;
  position: relative;

  .breadcrumb {
    margin-bottom: 16px;
  }

  .top-actions {
    position: sticky;
    top: 0;
    z-index: 100;
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
    background: #f0f2f5;
    padding: 8px 0;
  }

  .config-card {
    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .config-collapse {
    border: none;

    :deep(.el-collapse-item__header) {
      height: 50px;
      line-height: 50px;
      padding: 0 20px;
      font-size: 15px;
      font-weight: 600;
      background: #fafafa;
      border-bottom: 1px solid #e4e7ed;
    }

    :deep(.el-collapse-item__content) {
      padding: 24px 20px;
    }
  }

  .module-title {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    .help-icon {
      color: #909399;
      cursor: help;

      &:hover {
        color: #409eff;
      }
    }
  }

  .config-form {
    .form-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }

    .logo-uploader {
      :deep(.el-upload) {
        border: 1px dashed #dcdfe6;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
        }
      }

      .logo-preview {
        width: 200px;
        height: 60px;
        display: block;
        object-fit: contain;
      }

      .logo-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 200px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .banner-uploader {
      :deep(.el-upload) {
        display: inline-block;
      }

      .banner-preview {
        width: 100%;
        max-height: 150px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 8px;
      }
    }
  }

  .config-tips {
    position: sticky;
    bottom: 0;
    z-index: 99;
    background: #fff;
    border-top: 1px solid #e4e7ed;
    padding: 12px 16px;
    margin-top: 16px;

    .tips-content {
      p {
        margin: 4px 0;
        font-size: 13px;
        color: #606266;
        line-height: 1.6;
      }
    }
  }
}
</style>
