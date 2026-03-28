<template>
  <div class="process-designer-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>流程设计器</span>
          <el-button type="primary" @click="handleSave">保存流程</el-button>
        </div>
      </template>

      <div class="designer-container">
        <div class="toolbox">
          <h4>工具箱</h4>
          <el-button icon="Plus" long>开始节点</el-button>
          <el-button icon="Document" long>审批节点</el-button>
          <el-button icon="Connection" long>条件分支</el-button>
          <el-button icon="Check" long>结束节点</el-button>
        </div>

        <div class="canvas" ref="canvasRef">
          <div class="process-nodes">
            <div class="node start-node">
              <el-icon><CircleCheck /></el-icon>
              <span>开始</span>
            </div>
            <div class="node approve-node">
              <el-icon><UserFilled /></el-icon>
              <span>部门经理审批</span>
            </div>
            <div class="node approve-node">
              <el-icon><UserFilled /></el-icon>
              <span>总经理审批</span>
            </div>
            <div class="node end-node">
              <el-icon><CircleCheckFilled /></el-icon>
              <span>结束</span>
            </div>
          </div>
        </div>

        <div class="properties-panel">
          <h4>属性面板</h4>
          <el-form label-width="80px" size="small">
            <el-form-item label="节点名称">
              <el-input placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="审批人">
              <el-select placeholder="请选择">
                <el-option label="张三" value="1" />
                <el-option label="李四" value="2" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck, UserFilled, CircleCheckFilled } from '@element-plus/icons-vue'

const canvasRef = ref(null)

const handleSave = () => {
  ElMessage.success('流程保存成功')
}
</script>

<style lang="scss" scoped>
.process-designer-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .designer-container {
    display: flex;
    height: 600px;

    .toolbox {
      width: 200px;
      padding: 20px;
      border-right: 1px solid #ebeef5;

      h4 {
        margin-bottom: 15px;
        font-size: 14px;
        color: #606266;
      }

      .el-button {
        margin-bottom: 10px;
        width: 100%;
      }
    }

    .canvas {
      flex: 1;
      background: #f5f7fa;
      position: relative;
      overflow: auto;

      .process-nodes {
        padding: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 60px;

        .node {
          width: 160px;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;

          .el-icon {
            font-size: 32px;
          }

          span {
            font-size: 14px;
            color: #606266;
          }

          &.start-node {
            border: 2px solid #67c23a;

            .el-icon {
              color: #67c23a;
            }
          }

          &.approve-node {
            border: 2px solid #409eff;

            .el-icon {
              color: #409eff;
            }
          }

          &.end-node {
            border: 2px solid #909399;

            .el-icon {
              color: #909399;
            }
          }
        }
      }
    }

    .properties-panel {
      width: 250px;
      padding: 20px;
      border-left: 1px solid #ebeef5;

      h4 {
        margin-bottom: 15px;
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
