<template>
  <div class="right-panel">
    <div v-if="currentRule" class="edit-panel">
      <div class="panel-title">可见范围规则编辑</div>
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef" class="edit-form">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="适用对象" prop="target">
          <el-select v-model="form.target" placeholder="选择适用对象" style="width: 100%">
            <el-option label="全体员工" value="全体员工" />
            <el-option label="指定部门" value="指定部门" />
            <el-option label="指定角色" value="指定角色" />
            <el-option label="指定人员" value="指定人员" />
          </el-select>
        </el-form-item>
        <el-form-item label="可见范围" prop="scope">
          <el-select v-model="form.scope" placeholder="选择可见范围" style="width: 100%">
            <el-option label="全公司" value="全公司" />
            <el-option label="本部门及下级" value="本部门及下级" />
            <el-option label="仅本人" value="仅本人" />
            <el-option label="指定部门" value="指定部门" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleConfirm">保存</el-button>
          <el-button @click="$emit('cancel')">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-else-if="currentField" class="edit-panel">
      <div class="panel-title">展示字段配置编辑</div>
      <el-form :model="fieldForm" label-width="120px" class="edit-form">
        <el-form-item label="字段名称">
          <el-input v-model="fieldForm.name" disabled />
        </el-form-item>
        <el-form-item label="可见权限">
          <el-select v-model="fieldForm.permission" placeholder="选择权限" style="width: 100%">
            <el-option label="全员可见" value="全员可见" />
            <el-option label="仅管理层可见" value="仅管理层可见" />
            <el-option label="仅本部门可见" value="仅本部门可见" />
            <el-option label="不可见" value="不可见" />
          </el-select>
        </el-form-item>
        <el-form-item label="脱敏规则">
          <el-select v-model="fieldForm.maskRule" placeholder="选择脱敏规则" style="width: 100%">
            <el-option label="无脱敏" value="无脱敏" />
            <el-option label="中间4位星号" value="中间4位星号" />
            <el-option label="仅显示前3位" value="仅显示前3位" />
            <el-option label="完全隐藏" value="完全隐藏" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="fieldForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
              v-model="fieldForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="$emit('confirm-field')">保存</el-button>
          <el-button @click="$emit('cancel-field')">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-else class="empty-panel">
      <el-empty description="点击左侧规则或字段进行编辑" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentRule: {
    type: Object,
    default: null
  },
  currentField: {
    type: Object,
    default: null
  },
  form: {
    type: Object,
    required: true
  },
  fieldForm: {
    type: Object,
    required: true
  },
  rules: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['confirm', 'cancel', 'confirm-field', 'cancel-field'])

const formRef = ref(null)

const handleConfirm = () => {
  emit('confirm')
}

defineExpose({
  formRef
})
</script>

<style lang="scss" scoped>
.right-panel {
  width: 40%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  .edit-panel {
    height: 100%;
    padding: 20px;
    overflow-y: auto;

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;
      color: #303133;
    }

    .edit-form {
      max-width: 100%;
    }
  }

  .empty-panel {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
