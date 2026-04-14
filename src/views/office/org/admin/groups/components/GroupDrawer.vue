<template>
  <el-drawer
      v-model="visible"
      :title="drawerTitle"
      size="700px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
    >
      <el-divider content-position="left">基础信息</el-divider>

      <el-form-item label="群组名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入群组名称" />
      </el-form-item>

      <el-form-item label="上级群组">
        <el-tree-select
            v-model="formData.parentId"
            :data="groupTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            clearable
            placeholder="选择上级群组（可选）"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="群组类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio label="department" value="department">部门群</el-radio>
          <el-radio label="project" value="project">项目群</el-radio>
          <el-radio label="system" value="system">系统群</el-radio>
          <el-radio label="temporary" value="temporary">临时群</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="群组状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled" value="enabled">启用</el-radio>
          <el-radio label="disabled" value="disabled">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-divider content-position="left">权限配置</el-divider>

      <el-form-item label="适用范围" prop="scope">
        <el-radio-group v-model="formData.scope" @change="handleScopeChange">
          <el-radio label="all" value="all">全公司可见</el-radio>
          <el-radio label="department" value="department">指定部门</el-radio>
          <el-radio label="position" value="position">指定岗位</el-radio>
          <el-radio label="custom" value="custom">自定义人员</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 指定部门 -->
      <el-form-item v-if="formData.scope === 'department'" label="选择部门">
        <el-tree-select
            v-model="formData.scopeDepartmentIds"
            :data="departmentTree"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            multiple
            check-strictly
            placeholder="选择部门"
            style="width: 100%"
        />
      </el-form-item>

      <!-- 指定岗位 -->
      <el-form-item v-if="formData.scope === 'position'" label="选择岗位">
        <el-select
            v-model="formData.scopePositionIds"
            multiple
            placeholder="选择岗位"
            style="width: 100%"
        >
          <el-option
              v-for="pos in positionsList"
              :key="pos.id"
              :label="pos.name"
              :value="pos.id"
          />
        </el-select>
      </el-form-item>

      <!-- 自定义人员 -->
      <el-form-item v-if="formData.scope === 'custom'" label="选择人员">
        <el-select
            v-model="formData.scopeUserIds"
            multiple
            placeholder="选择人员"
            style="width: 100%"
        >
          <el-option
              v-for="user in allUsers"
              :key="user.id"
              :label="`${user.name}（${user.department}）`"
              :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="群主" prop="ownerIds">
        <el-select
            v-model="formData.ownerIds"
            multiple
            placeholder="选择群主"
            style="width: 100%"
        >
          <el-option
              v-for="user in allUsers"
              :key="user.id"
              :label="user.name"
              :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">备注</el-divider>

      <el-form-item label="群组描述">
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入群组描述"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'add'
  },
  data: {
    type: Object,
    default: null
  },
  groupTree: {
    type: Array,
    default: () => []
  },
  departmentTree: {
    type: Array,
    default: () => []
  },
  positionsList: {
    type: Array,
    default: () => []
  },
  allUsers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  id: null,
  name: '',
  parentId: null,
  parentName: '根群组',
  type: 'department',
  status: 'enabled',
  scope: 'all',
  scopeDepartmentIds: [],
  scopePositionIds: [],
  scopeUserIds: [],
  ownerIds: [],
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入群组名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择群组类型', trigger: 'change' }],
  scope: [{ required: true, message: '请选择适用范围', trigger: 'change' }],
  ownerIds: [{ required: true, message: '请选择群主', trigger: 'change' }]
}

const drawerTitle = computed(() => {
  return formData.id ? '编辑群组' : '新增群组'
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
  } else if (val) {
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    parentId: null,
    parentName: '根群组',
    type: 'department',
    status: 'enabled',
    scope: 'all',
    scopeDepartmentIds: [],
    scopePositionIds: [],
    scopeUserIds: [],
    ownerIds: [],
    description: ''
  })
}

const handleScopeChange = () => {
  formData.scopeDepartmentIds = []
  formData.scopePositionIds = []
  formData.scopeUserIds = []
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true

      // 获取群主名称
      const ownerNames = formData.ownerIds.map(id => {
        const user = props.allUsers.find(u => u.id === id)
        return user?.name
      }).filter(Boolean).join('、')

      // 获取适用范围名称
      let scopeName = '全公司'
      if (formData.scope === 'department') {
        scopeName = '指定部门'
      } else if (formData.scope === 'position') {
        scopeName = '指定岗位'
      } else if (formData.scope === 'custom') {
        scopeName = '自定义人员'
      }

      // 获取上级群组名称
      let parentName = '根群组'
      if (formData.parentId) {
        const findGroup = (nodes, id) => {
          for (const node of nodes) {
            if (node.id === id) return node.name
            if (node.children) {
              const found = findGroup(node.children, id)
              if (found) return found
            }
          }
          return null
        }
        parentName = findGroup(props.groupTree, formData.parentId) || '根群组'
      }

      const groupTypeNames = {
        'department': '部门群',
        'project': '项目群',
        'system': '系统群',
        'temporary': '临时群'
      }

      setTimeout(() => {
        saving.value = false
        emit('confirm', {
          ...formData,
          owner: ownerNames,
          scopeName,
          parentName,
          typeName: groupTypeNames[formData.type],
          isSystem: formData.type === 'system'
        })
      }, 500)
    }
  })
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
