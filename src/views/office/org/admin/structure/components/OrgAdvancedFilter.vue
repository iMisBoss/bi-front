<template>
  <el-dialog
      v-model="visible"
      title="高级筛选"
      width="600px"
      @close="handleClose"
  >
    <el-form :model="filterForm" label-width="100px">
      <el-form-item label="创建时间">
        <el-date-picker
            v-model="filterForm.createTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="部门层级">
        <el-select v-model="filterForm.level" placeholder="选择层级" style="width: 100%">
          <el-option label="一级部门" :value="1" />
          <el-option label="二级部门" :value="2" />
          <el-option label="三级部门" :value="3" />
          <el-option label="四级及以下" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="人员数量">
        <el-row :gutter="10">
          <el-col :span="11">
            <el-input-number
                v-model="filterForm.minMembers"
                placeholder="最小值"
                :min="0"
                style="width: 100%"
            />
          </el-col>
          <el-col :span="2" style="text-align: center">-</el-col>
          <el-col :span="11">
            <el-input-number
                v-model="filterForm.maxMembers"
                placeholder="最大值"
                :min="0"
                style="width: 100%"
            />
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleApply">应用筛选</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'apply', 'reset'])

const visible = ref(props.modelValue)

const filterForm = reactive({
  createTimeRange: [],
  level: null,
  minMembers: null,
  maxMembers: null
})

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
}

const handleReset = () => {
  filterForm.createTimeRange = []
  filterForm.level = null
  filterForm.minMembers = null
  filterForm.maxMembers = null
  emit('reset')
}

const handleApply = () => {
  emit('apply', { ...filterForm })
  visible.value = false
}
</script>
