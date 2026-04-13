<template>
  <el-dialog v-model="visible" title="组织树显示设置" width="500px">
    <el-form label-width="120px">
      <el-form-item label="显示成员数">
        <el-switch v-model="localSettings.showMemberCount" />
      </el-form-item>
      <el-form-item label="显示负责人">
        <el-switch v-model="localSettings.showLeader" />
      </el-form-item>
      <el-form-item label="显示办公地点">
        <el-switch v-model="localSettings.showLocation" />
      </el-form-item>
      <el-form-item label="树形密度">
        <el-radio-group v-model="localSettings.density">
          <el-radio label="compact">紧凑</el-radio>
          <el-radio label="standard">标准</el-radio>
          <el-radio label="loose">宽松</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  settings: Object
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const localSettings = computed({
  get: () => props.settings,
  set: (val) => val
})

const handleSave = () => {
  emit('save', { ...localSettings.value })
  visible.value = false
}
</script>
