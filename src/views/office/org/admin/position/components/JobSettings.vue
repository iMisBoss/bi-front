<template>
  <el-dialog
      v-model="dialogVisible"
      title="列表显示设置"
      width="500px"
  >
    <el-form label-width="120px">
      <el-form-item label="显示字段">
        <el-checkbox-group v-model="settings.visibleFields">
          <el-checkbox label="id">职务编码</el-checkbox>
          <el-checkbox label="level">职级级别</el-checkbox>
          <el-checkbox label="linkedPositions">关联岗位数</el-checkbox>
          <el-checkbox label="sort">排序号</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="分页大小">
        <el-select v-model="settings.pageSize" style="width: 120px">
          <el-option label="10" :value="10" />
          <el-option label="20" :value="20" />
          <el-option label="50" :value="50" />
          <el-option label="100" :value="100" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'save'])

const dialogVisible = ref(false)

const settings = ref({
  visibleFields: ['id', 'level', 'linkedPositions'],
  pageSize: 10
})

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleSave = () => {
  emit('save', settings.value)
  dialogVisible.value = false
}
</script>
