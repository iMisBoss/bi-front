<template>
  <el-dialog
      :model-value="visible"
      @update:model-value="$emit('update:visible', $event)"
      title="纪要模板管理"
      width="900px"
  >
    <div class="template-management">
      <div class="action-bar">
        <el-button type="primary" @click="showAddTemplate = true">
          <el-icon><Plus /></el-icon>
          添加模板
        </el-button>
      </div>

      <el-table :data="templates" border stripe>
        <el-table-column prop="name" label="模板名称" width="200" />
        <el-table-column prop="type" label="适用类型" width="150">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="模板说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="usageCount" label="使用次数" width="100" align="center" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="editTemplate(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="deleteTemplate(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 添加/编辑模板对话框 -->
  <el-dialog
      v-model="showAddTemplate"
      :title="editingTemplate ? '编辑模板' : '添加模板'"
      width="700px"
  >
    <el-form :model="templateForm" label-width="100px">
      <el-form-item label="模板名称">
        <el-input v-model="templateForm.name" placeholder="如：部门周例会模板" />
      </el-form-item>
      <el-form-item label="适用类型">
        <el-select v-model="templateForm.type" style="width: 100%">
          <el-option label="部门例会" value="dept" />
          <el-option label="项目评审" value="project" />
          <el-option label="培训会" value="training" />
          <el-option label="涉密会议" value="secret" />
          <el-option label="外部会议" value="external" />
        </el-select>
      </el-form-item>
      <el-form-item label="模板说明">
        <el-input v-model="templateForm.description" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="固定议题">
        <el-input
            v-model="templateForm.fixedTopics"
            type="textarea"
            :rows="4"
            placeholder="每行一个固定议题，如：&#10;1. 上周工作总结&#10;2. 本周工作计划&#10;3. 问题与困难"
        />
      </el-form-item>
      <el-form-item label="决议模板">
        <el-input
            v-model="templateForm.decisionTemplate"
            type="textarea"
            :rows="3"
            placeholder="决议格式模板"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showAddTemplate = false">取消</el-button>
      <el-button type="primary" @click="handleSaveTemplate">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])

const showAddTemplate = ref(false)
const editingTemplate = ref(null)

const templates = ref([
  {
    id: 1,
    name: '部门周例会模板',
    type: 'dept',
    description: '适用于各部门每周例会，包含固定议题格式',
    usageCount: 156
  },
  {
    id: 2,
    name: '项目评审会模板',
    type: 'project',
    description: '适用于项目评审、需求评审等技术会议',
    usageCount: 89
  },
  {
    id: 3,
    name: '培训会议模板',
    type: 'training',
    description: '适用于内部培训、知识分享会议',
    usageCount: 45
  },
  {
    id: 4,
    name: '高管涉密会议模板',
    type: 'secret',
    description: '适用于高管会议、涉密会议，强化权限管控',
    usageCount: 12
  }
])

const templateForm = reactive({
  name: '',
  type: 'dept',
  description: '',
  fixedTopics: '',
  decisionTemplate: ''
})

const getTypeText = (type) => {
  const texts = {
    dept: '部门例会',
    project: '项目评审',
    training: '培训会',
    secret: '涉密会议',
    external: '外部会议'
  }
  return texts[type] || '未知'
}

const editTemplate = (row) => {
  editingTemplate.value = row
  Object.assign(templateForm, row)
  showAddTemplate.value = true
}

const deleteTemplate = (row) => {
  ElMessageBox.confirm(`确认删除模板"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = templates.value.findIndex(t => t.id === row.id)
    if (index > -1) {
      templates.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSaveTemplate = () => {
  if (editingTemplate.value) {
    const index = templates.value.findIndex(t => t.id === editingTemplate.value.id)
    if (index > -1) {
      templates.value[index] = { ...templateForm, id: editingTemplate.value.id }
    }
    ElMessage.success('修改成功')
  } else {
    templates.value.push({
      ...templateForm,
      id: Date.now(),
      usageCount: 0
    })
    ElMessage.success('添加成功')
  }
  showAddTemplate.value = false
}
</script>

<style lang="scss" scoped>
.template-management {
  .action-bar {
    margin-bottom: 16px;
  }
}
</style>
