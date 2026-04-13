<template>
  <div class="version-diff">
    <div class="diff-toolbar">
      <el-button type="primary" size="default" icon="Download" @click="handleExportDiff">导出差异报告</el-button>
      <el-button size="default" icon="Refresh" @click="handleRefreshDiff">刷新对比</el-button>
    </div>

    <el-table :data="diffList" border style="width: 100%" max-height="400" :row-class-name="diffRowClassName">
      <el-table-column prop="category" label="对比维度" width="120" />
      <el-table-column prop="fieldName" label="字段/项名称" min-width="150" />
      <el-table-column prop="originalValue" :label="'原版本 V' + originalVersion" min-width="200" show-overflow-tooltip />
      <el-table-column prop="newValue" :label="'新版本 V' + newVersion" min-width="200" show-overflow-tooltip />
      <el-table-column prop="changeType" label="差异类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getChangeTypeTag(row.changeType)" size="small">
            {{ getChangeTypeText(row.changeType) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="diffList.length === 0" description="暂无差异，当前新版本与原版本配置一致" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  originalVersion: {
    type: String,
    default: '1.0'
  },
  newVersion: {
    type: String,
    default: '1.1'
  },
  diffData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

// 测试数据
const defaultDiffData = [
  {
    category: '字段定义',
    fieldName: '车辆类型',
    originalValue: '无此字段',
    newValue: 'varchar(50) - 车辆类型（新增）',
    changeType: '新增'
  },
  {
    category: '字段定义',
    fieldName: '车牌号码',
    originalValue: '无此字段',
    newValue: 'varchar(20) - 车牌号码（新增）',
    changeType: '新增'
  },
  {
    category: '字段定义',
    fieldName: '用车事由',
    originalValue: 'varchar(500) - 用车事由',
    newValue: 'varchar(2000) - 用车事由（长度扩展）',
    changeType: '修改'
  },
  {
    category: '关联关系',
    fieldName: '紧急联系人',
    originalValue: '无此字段',
    newValue: 'varchar(100) - 紧急联系人（新增）',
    changeType: '新增'
  },
  {
    category: '数据规则',
    fieldName: '用车时间校验规则',
    originalValue: '开始时间不能早于当前时间',
    newValue: '开始时间不能早于当前时间 + 结束时间必须晚于开始时间',
    changeType: '修改'
  },
  {
    category: '索引管理',
    fieldName: 'idx_vehicle_type',
    originalValue: '无此索引',
    newValue: '普通索引 - 车辆类型（新增）',
    changeType: '新增'
  },
  {
    category: '使用范围',
    fieldName: '车辆申请审批表单',
    originalValue: '未纳入使用范围',
    newValue: '已纳入使用范围（新增）',
    changeType: '新增'
  }
]

const diffList = ref(props.diffData.length > 0 ? props.diffData : defaultDiffData)

watch(() => props.diffData, (newVal) => {
  diffList.value = newVal.length > 0 ? newVal : defaultDiffData
}, { deep: true })

// 初始化时确保有测试数据
onMounted(() => {
  if (diffList.value.length === 0) {
    diffList.value = defaultDiffData
  }
})

const handleExportDiff = () => {
  ElMessageBox.confirm('确定要导出差异报告吗？', '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    // 构建导出数据
    const exportData = diffList.value.map(item => ({
      对比维度: item.category,
      字段项名称: item.fieldName,
      原版本值: item.originalValue,
      新版本值: item.newValue,
      差异类型: item.changeType
    }))

    // 生成 CSV
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n')

    // 下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `版本差异对比_V${props.originalVersion}_V${props.newVersion}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success(`成功导出 ${exportData.length} 条差异记录`)
  }).catch(() => {})
}

const handleRefreshDiff = () => {
  emit('refresh')
  ElMessage.success('差异对比已刷新')
}

const diffRowClassName = ({ row }) => {
  if (row.changeType === '新增') return 'diff-row-add'
  if (row.changeType === '修改') return 'diff-row-modify'
  if (row.changeType === '删除') return 'diff-row-delete'
  return ''
}

const getChangeTypeTag = (type) => {
  const tags = {
    '新增': 'success',
    '修改': 'warning',
    '删除': 'danger'
  }
  return tags[type] || 'info'
}

const getChangeTypeText = (type) => {
  return type || '-'
}

defineExpose({
  diffList
})
</script>

<style scoped lang="scss">
.version-diff {
  .diff-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  :deep(.diff-row-add) {
    background-color: #f0f9eb !important;
  }

  :deep(.diff-row-modify) {
    background-color: #fdf6ec !important;
  }

  :deep(.diff-row-delete) {
    background-color: #fef0f0 !important;
  }
}
</style>
