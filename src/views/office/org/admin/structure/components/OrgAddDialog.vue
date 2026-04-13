<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="600px">
    <el-form :model="form" label-width="120px">
      <el-form-item v-if="type === 'department'" label="组织名称" required>
        <el-input v-model="form.name" placeholder="请输入组织名称" />
      </el-form-item>
      <el-form-item v-if="type === 'department'" label="组织编码" required>
        <el-input v-model="form.code" placeholder="请输入组织编码" />
      </el-form-item>
      <el-form-item v-if="type === 'department'" label="上级组织">
        <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            :render-after-expand="false"
            clearable
            placeholder="请选择上级组织"
        />
      </el-form-item>
      <el-form-item v-if="type === 'position'" label="岗位名称" required>
        <el-input v-model="form.name" placeholder="请输入岗位名称" />
      </el-form-item>
      <el-form-item v-if="type === 'position'" label="岗位编码" required>
        <el-input v-model="form.code" placeholder="请输入岗位编码" />
      </el-form-item>
      <el-form-item label="负责人">
        <el-select v-model="form.leaderIds" multiple filterable placeholder="选择负责人">
          <el-option
              v-for="person in personnelList"
              :key="person.id"
              :label="person.name"
              :value="person.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="type === 'department'" label="办公地点">
        <el-select v-model="form.locationIds" multiple placeholder="选择办公地点">
          <el-option
              v-for="location in locationList"
              :key="location.id"
              :label="location.name"
              :value="location.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  type: String,
  parentId: Number,
  editData: Object,
  parentOptions: Array,
  personnelList: Array,
  locationList: Array
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const dialogTitle = computed(() => {
  const isEdit = !!props.editData
  if (props.type === 'position') {
    return isEdit ? '编辑岗位' : '新增岗位'
  }
  return isEdit ? '编辑部门' : '新增部门'
})

const form = reactive({
  name: '',
  code: '',
  parentId: null,
  leaderIds: [],
  locationIds: [],
  remark: ''
})

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.editData) {
      Object.assign(form, props.editData)
    } else {
      form.name = ''
      form.code = ''
      form.parentId = props.parentId || null
      form.leaderIds = []
      form.locationIds = []
      form.remark = ''
    }
  }
})

const handleConfirm = () => {
  emit('confirm', { ...form, type: props.type })
}
</script>
