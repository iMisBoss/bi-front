<template>
  <el-dialog
      v-model="dialogVisible"
      title="关联关系可视化视图"
      width="90vw"
      top="5vh"
      :close-on-click-modal="false"
      @closed="handleClosed"
      class="relation-visual-dialog"
      append-to-body
  >
    <!-- 顶部操作栏 -->
    <div class="visual-toolbar">
      <el-button type="primary" size="small" icon="Refresh" @click="refreshChart">刷新</el-button>
      <el-button size="small" icon="Aim" @click="resetZoom">重置缩放</el-button>
      <el-button size="small" icon="Download" @click="exportImage">导出图片</el-button>
      <el-button size="small" icon="Document" @click="exportPdf">导出 PDF</el-button>
      <el-tag type="info" size="small" class="data-count-tag">
        共 {{ props.relationData.length }} 个关联关系
      </el-tag>
    </div>

    <!-- 空状态提示 -->
    <el-empty
        v-if="isEmpty"
        description="暂无关联关系数据"
        :image-size="120"
        class="empty-state"
    >
      <el-button type="primary" @click="handleAddRelation">新增关联</el-button>
    </el-empty>

    <!-- ECharts 画布容器 -->
    <div v-show="!isEmpty" ref="chartRef" class="visual-chart"></div>
  </el-dialog>
</template>

<script setup>import { ref, watch, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { Refresh, Aim, Download, Document } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  relationData: {
    type: Array,
    default: () => []
  },
  currentBizObject: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(false)
const chartRef = ref(null)
let chartInstance = null
const hasInitialized = ref(false)

// 判断是否为空
const isEmpty = computed(() => {
  const result = !props.relationData || props.relationData.length === 0
  console.log('可视化视图 - 数据是否为空:', result, '数据:', props.relationData)
  return result
})

// 监听弹窗显示/隐藏
watch(() => props.modelValue, (val) => {
  console.log('可视化视图 - 弹窗状态变化:', val)
  dialogVisible.value = val
  if (val && !isEmpty.value) {
    console.log('可视化视图 - 准备初始化图表')
    nextTick(() => {
      setTimeout(() => {
        initChart()
      }, 300)
    })
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 监听数据变化
watch(() => props.relationData, (newVal) => {
  console.log('可视化视图 - 数据变化:', newVal)
  if (dialogVisible.value && !isEmpty.value) {
    setTimeout(() => {
      initChart()
    }, 100)
  }
}, { deep: true })

// 初始化 ECharts
const initChart = () => {
  console.log('可视化视图 - 开始初始化图表')
  console.log('可视化视图 - chartRef.value:', chartRef.value)
  console.log('可视化视图 - props.relationData:', props.relationData)
  console.log('可视化视图 - props.currentBizObject:', props.currentBizObject)

  if (!chartRef.value) {
    console.error('可视化视图 - 图表容器未找到')
    return
  }

  // 销毁旧实例，避免内存泄漏
  if (chartInstance) {
    console.log('可视化视图 - 销毁旧实例')
    chartInstance.dispose()
    chartInstance = null
  }

  try {
    // 初始化图表实例
    chartInstance = echarts.init(chartRef.value)
    console.log('可视化视图 - ECharts 实例创建成功')

    // 转换数据格式
    const { nodes, links } = transformData(props.relationData, props.currentBizObject)
    console.log('可视化视图 - 转换后的数据:', { nodes, links })

    if (nodes.length === 0) {
      console.warn('可视化视图 - 没有节点数据')
      ElMessage.warning('没有可展示的关联关系数据')
      return
    }

    // ECharts 配置
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.dataType === 'node') {
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;">${params.name}</div>
                <div style="color: #666; font-size: 12px;">表名：${params.data.tableName || '-'}</div>
                <div style="color: #666; font-size: 12px;">类型：${params.data.isCurrent ? '当前业务对象' : '关联业务对象'}</div>
                ${params.data.relationCount !== undefined ? `<div style="color: #666; font-size: 12px;">关联数量：${params.data.relationCount}</div>` : ''}
              </div>
            `
          } else {
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;">${params.data.relationName}</div>
                <div style="color: #666; font-size: 12px;">关联类型：${params.data.relationType}</div>
                <div style="color: #666; font-size: 12px;">外键：${params.data.foreignKey}</div>
                <div style="color: #666; font-size: 12px;">主键：${params.data.primaryKey}</div>
                <div style="color: #666; font-size: 12px;">级联删除：${params.data.cascadeDelete ? '开启' : '关闭'}</div>
              </div>
            `
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e4e7ed',
        borderWidth: 1,
        textStyle: {
          color: '#303133'
        }
      },
      legend: {
        data: ['当前业务对象', '关联业务对象'],
        top: 10,
        itemGap: 20
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          symbolSize: 70,
          roam: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            fontSize: 12,
            fontWeight: 500
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            fontSize: 11,
            show: true,
            formatter: (params) => {
              return params.data.relationName || ''
            }
          },
          force: {
            repulsion: 1500,
            edgeLength: 180,
            gravity: 0.1
          },
          draggable: false,
          categories: [
            { name: '当前业务对象' },
            { name: '关联业务对象' }
          ],
          data: nodes,
          links: links,
          lineStyle: {
            opacity: 0.9,
            width: 2,
            curveness: 0.2
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4
            }
          }
        }
      ]
    }

    chartInstance.setOption(option)
    console.log('可视化视图 - 图表配置已应用')

    // 监听窗口大小变化，自适应
    window.addEventListener('resize', handleResize)
    hasInitialized.value = true

  } catch (error) {
    console.error('可视化视图 - 图表初始化失败:', error)
    ElMessage.error('图表初始化失败：' + error.message)
  }
}

// 转换后端数据为 ECharts 需要的 nodes/links 格式
const transformData = (relationList, currentBiz) => {
  console.log('可视化视图 - 转换数据，输入:', { relationList, currentBiz })

  const nodes = []
  const links = []
  const nodeMap = new Map()
  const relationCountMap = new Map()

  // 统计每个关联对象的关联数量
  relationList.forEach(relation => {
    const targetId = relation.targetObject || `target_${relation.id}`
    relationCountMap.set(targetId, (relationCountMap.get(targetId) || 0) + 1)
  })

  // 1. 添加当前业务对象节点（居中高亮）
  const currentNodeId = currentBiz.tableName || 'current'
  nodes.push({
    id: currentNodeId,
    name: currentBiz.name || '当前业务对象',
    tableName: currentBiz.tableName,
    isCurrent: true,
    relationCount: relationList.length,
    itemStyle: {
      color: '#409EFF',
      shadowColor: 'rgba(64, 158, 255, 0.4)',
      shadowBlur: 20
    },
    category: '当前业务对象'
  })
  nodeMap.set(currentNodeId, true)

  // 2. 遍历关联关系，添加节点和边
  relationList.forEach((relation, index) => {
    const targetNodeId = relation.targetObject || `target_${index}`

    // 添加关联业务对象节点（如果还没加）
    if (!nodeMap.has(targetNodeId)) {
      nodes.push({
        id: targetNodeId,
        name: relation.targetObject,
        tableName: relation.foreignKey?.split('_')[0] || '',
        isCurrent: false,
        relationCount: relationCountMap.get(targetNodeId) || 1,
        itemStyle: {
          color: '#67C23A',
          shadowColor: 'rgba(103, 194, 58, 0.3)',
          shadowBlur: 15
        },
        category: '关联业务对象'
      })
      nodeMap.set(targetNodeId, true)
    }

    // 添加关联边
    const lineColor = getRelationTypeColor(relation.relationType)
    links.push({
      source: currentNodeId,
      target: targetNodeId,
      relationName: relation.relationName,
      relationType: getRelationTypeText(relation.relationType),
      foreignKey: relation.foreignKey,
      primaryKey: relation.primaryKey,
      cascadeDelete: relation.cascadeDelete,
      lineStyle: {
        color: lineColor,
        width: relation.cascadeDelete ? 3 : 2
      }
    })
  })

  console.log('可视化视图 - 转换后的数据:', { nodes, links })
  return { nodes, links }
}

// 根据关联类型返回不同颜色
const getRelationTypeColor = (type) => {
  const colorMap = {
    'many_to_one': '#E6A23C',
    'one_to_many': '#67C23A',
    'one_to_one': '#409EFF',
    'many_to_many': '#F56C6C'
  }
  return colorMap[type] || '#909399'
}

// 获取关联类型文本
const getRelationTypeText = (type) => {
  const textMap = {
    'many_to_one': '多对一',
    'one_to_many': '一对多',
    'one_to_one': '一对一',
    'many_to_many': '多对多'
  }
  return textMap[type] || type
}

// 刷新图表
const refreshChart = () => {
  initChart()
  ElMessage.success('图表已刷新')
}

// 重置缩放
const resetZoom = () => {
  if (chartInstance) {
    chartInstance.dispatchAction({
      type: 'restore'
    })
    ElMessage.success('已重置缩放')
  }
}

// 导出图片
const exportImage = () => {
  if (chartInstance) {
    const url = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    })
    const link = document.createElement('a')
    link.download = `${props.currentBizObject.name || '关联关系'}_可视化视图.png`
    link.href = url
    link.click()
    ElMessage.success('图片导出成功')
  }
}

// 导出 PDF
const exportPdf = async () => {
  if (!chartRef.value) return

  try {
    ElMessage.info('正在生成 PDF，请稍候...')

    const canvas = await html2canvas(chartRef.value, {
      backgroundColor: '#fff',
      scale: 2,
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4')

    const imgWidth = 280
    const pageHeight = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`${props.currentBizObject.name || '关联关系'}_可视化视图.pdf`)
    ElMessage.success('PDF 导出成功')
  } catch (error) {
    console.error('导出 PDF 失败', error)
    ElMessage.error('导出 PDF 失败，请重试')
  }
}

// 新增关联
const handleAddRelation = () => {
  dialogVisible.value = false
  emit('add-relation')
}

// 弹窗关闭时销毁实例
const handleClosed = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
  hasInitialized.value = false
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 组件卸载时清理
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.relation-visual-dialog {
  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #ebeef5;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    margin: -24px -24px 0;
    padding: 20px 24px;

    .el-dialog__title {
      color: #fff;
      font-weight: 600;
      font-size: 16px;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: #fff;
        font-size: 18px;

        &:hover {
          color: #f0f0f0;
        }
      }
    }
  }

  .visual-toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #ebeef5;
    align-items: center;

    .data-count-tag {
      margin-left: auto;
    }
  }

  .visual-chart {
    width: 100%;
    height: 70vh;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    background: #fafbfc;
  }

  .empty-state {
    padding: 60px 0;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #ebeef5;
    text-align: center;
    color: #909399;
    font-size: 13px;
  }
}
</style>
