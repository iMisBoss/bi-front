<template>
  <div class="process-flowchart">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>流程图</span>
          <el-button-group>
            <el-button @click="zoomIn" icon="Plus">放大</el-button>
            <el-button @click="zoomOut" icon="Minus">缩小</el-button>
            <el-button @click="resetZoom" icon="Refresh">重置</el-button>
          </el-button-group>
        </div>
      </template>
      <div class="flowchart-container" ref="flowchartRef">
        <div class="flowchart-content" :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }">
          <!-- 使用 SVG 绘制简易流程图 -->
          <svg class="flowchart-svg" viewBox="0 0 800 600" width="800" height="600">
            <!-- 定义箭头标记 -->
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#909399"/>
              </marker>
            </defs>

            <!-- 节点 1: 开始 -->
            <g class="flowchart-node" @click="handleNodeClick(nodes[0])">
              <rect x="300" y="20" width="200" height="60" rx="30" ry="30"
                    :fill="nodes[0].status === 'completed' ? '#67C23A' : '#E6F7FF'"
                    :stroke="nodes[0].status === 'completed' ? '#67C23A' : '#1890FF'"
                    stroke-width="2"/>
              <text x="400" y="55" text-anchor="middle" fill="#333" font-size="14">{{ nodes[0].name }}</text>
            </g>

            <!-- 连接线 1-2 -->
            <line x1="400" y1="80" x2="400" y2="120" stroke="#909399" stroke-width="2" marker-end="url(#arrowhead)"/>

            <!-- 节点 2: 部门经理审批 -->
            <g class="flowchart-node" @click="handleNodeClick(nodes[1])">
              <rect x="300" y="120" width="200" height="60"
                    :fill="nodes[1].status === 'completed' ? '#67C23A' : nodes[1].status === 'current' ? '#E6A23C' : '#F5F7FA'"
                    :stroke="nodes[1].status === 'completed' ? '#67C23A' : nodes[1].status === 'current' ? '#E6A23C' : '#909399'"
                    stroke-width="2"/>
              <text x="400" y="155" text-anchor="middle" fill="#333" font-size="14">{{ nodes[1].name }}</text>
            </g>

            <!-- 连接线 2-3 -->
            <line x1="400" y1="180" x2="400" y2="220" stroke="#909399" stroke-width="2" marker-end="url(#arrowhead)"/>

            <!-- 节点 3: 分管领导审批 -->
            <g class="flowchart-node" @click="handleNodeClick(nodes[2])">
              <rect x="300" y="220" width="200" height="60"
                    :fill="nodes[2].status === 'completed' ? '#67C23A' : nodes[2].status === 'current' ? '#E6A23C' : '#F5F7FA'"
                    :stroke="nodes[2].status === 'completed' ? '#67C23A' : nodes[2].status === 'current' ? '#E6A23C' : '#909399'"
                    stroke-width="2"/>
              <text x="400" y="255" text-anchor="middle" fill="#333" font-size="14">{{ nodes[2].name }}</text>
            </g>

            <!-- 连接线 3-4 -->
            <line x1="400" y1="280" x2="400" y2="320" stroke="#909399" stroke-width="2" marker-end="url(#arrowhead)"/>

            <!-- 节点 4: 总经理审批 -->
            <g class="flowchart-node" @click="handleNodeClick(nodes[3])">
              <rect x="300" y="320" width="200" height="60"
                    :fill="nodes[3].status === 'current' ? '#E6A23C' : '#F5F7FA'"
                    :stroke="nodes[3].status === 'current' ? '#E6A23C' : '#909399'"
                    stroke-width="2"/>
              <text x="400" y="355" text-anchor="middle" fill="#333" font-size="14">{{ nodes[3].name }}</text>
            </g>

            <!-- 连接线 4-5 -->
            <line x1="400" y1="380" x2="400" y2="420" stroke="#909399" stroke-width="2" marker-end="url(#arrowhead)"/>

            <!-- 节点 5: 结束 -->
            <g class="flowchart-node" @click="handleNodeClick(nodes[4])">
              <circle cx="400" cy="450" r="30"
                      :fill="nodes[4].status === 'wait' ? '#F5F7FA' : '#67C23A'"
                      :stroke="nodes[4].status === 'wait' ? '#909399' : '#67C23A'"
                      stroke-width="2"/>
              <text x="400" y="455" text-anchor="middle" fill="#333" font-size="14">{{ nodes[4].name }}</text>
            </g>
          </svg>

          <!-- 图例说明 -->
          <div class="legend">
            <div class="legend-item">
              <span class="legend-icon" style="background-color: #67C23A;"></span>
              <span>已完成</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon" style="background-color: #E6A23C;"></span>
              <span>进行中</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon" style="background-color: #F5F7FA; border: 2px solid #909399;"></span>
              <span>待处理</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const flowchartRef = ref(null)
const scale = ref(1)

// 流程节点数据
const nodes = ref([
  {
    name: '开始',
    handler: '张三',
    time: '2024-01-01 09:00:00',
    status: 'completed',
    comment: '同意'
  },
  {
    name: '部门经理审批',
    handler: '李四',
    time: '2024-01-01 14:30:00',
    status: 'completed',
    comment: '同意，请尽快推进'
  },
  {
    name: '分管领导审批',
    handler: '王五',
    time: '2024-01-02 10:15:00',
    status: 'current',
    comment: ''
  },
  {
    name: '总经理审批',
    handler: '',
    time: '',
    status: 'wait',
    comment: ''
  },
  {
    name: '结束',
    handler: '',
    time: '',
    status: 'wait',
    comment: ''
  }
])

const zoomIn = () => {
  if (scale.value < 2) {
    scale.value += 0.1
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value -= 0.1
  }
}

const resetZoom = () => {
  scale.value = 1
}

const handleNodeClick = (node) => {
  // 点击节点时可以显示详情或高亮
  console.log('点击节点:', node)
}
</script>

<style scoped lang="scss">
.process-flowchart {
  height: calc(100vh - 280px);
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background-color: #a8a8a8;
    }
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .flowchart-container {
    min-height: 500px;
    position: relative;

    .flowchart-content {
      padding: 20px;
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 800px;
    }

    .flowchart-svg {
      max-width: 100%;
      height: auto;

      .flowchart-node {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          filter: brightness(0.95);
          transform: scale(1.02);
        }
      }
    }

    .legend {
      margin-top: 30px;
      display: flex;
      gap: 20px;
      padding: 15px 20px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #666;

        .legend-icon {
          width: 16px;
          height: 16px;
          border-radius: 3px;
        }
      }
    }
  }
}
</style>
