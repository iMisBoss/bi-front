<template>
  <div class="config-management">
    <el-form :model="configForm" label-width="180px" class="config-form">
      <el-form-item label="会议室预约冲突校验">
        <el-switch
            v-model="configForm.conflictCheck"
            active-text="启用"
            inactive-text="禁用"
        />
        <div class="form-tip">启用后，同一时间段内同一会议室不能被重复预约</div>
      </el-form-item>

      <el-form-item label="会议重复预约限制">
        <el-switch
            v-model="configForm.repeatLimit"
            active-text="启用"
            inactive-text="禁用"
        />
        <div class="form-tip">启用后，限制同一会议的重复预约次数</div>
      </el-form-item>

      <el-form-item label="历史会议自动归档">
        <el-select v-model="configForm.autoArchive" style="width: 200px">
          <el-option label="7天" :value="7" />
          <el-option label="30天" :value="30" />
          <el-option label="90天" :value="90" />
        </el-select>
        <div class="form-tip">超过设定天数的已完成会议将自动归档</div>
      </el-form-item>

      <el-form-item label="参会人员可见范围">
        <el-select v-model="configForm.visibleScope" style="width: 200px">
          <el-option label="全员可见" value="all" />
          <el-option label="仅参会人可见" value="participants" />
        </el-select>
        <div class="form-tip">控制会议信息的可见范围</div>
      </el-form-item>

      <el-form-item label="会议数据保留时长">
        <el-select v-model="configForm.dataRetention" style="width: 200px">
          <el-option label="90天" :value="90" />
          <el-option label="180天" :value="180" />
          <el-option label="永久" value="permanent" />
        </el-select>
        <div class="form-tip">超过保留时长的会议数据将被清理</div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const saving = ref(false)

const configForm = reactive({
  conflictCheck: true,
  repeatLimit: true,
  autoArchive: 30,
  visibleScope: 'all',
  dataRetention: 'permanent'
})

const defaultConfig = { ...configForm }

const handleSave = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('配置保存成功')
  }, 500)
}

const handleReset = () => {
  Object.assign(configForm, defaultConfig)
  ElMessage.success('已重置为默认配置')
}

onMounted(() => {
  // 加载配置
})
</script>

<style scoped lang="scss">
.config-management {
  padding: 30px 40px;
  max-width: 800px;

  .config-form {
    .el-form-item {
      margin-bottom: 24px;
    }

    .form-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
      line-height: 1.5;
    }
  }
}
</style>
