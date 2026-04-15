<template>
  <div class="employee-page">
    <!-- 顶部操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
              v-model="searchKeyword"
              placeholder="搜索姓名/拼音/部门/工号"
              :prefix-icon="Search"
              clearable
              style="width: 280px"
              @input="handleSearch"
          />
          <el-radio-group v-model="viewMode" size="small" style="margin-left: 12px">
            <el-radio-button value="card">卡片</el-radio-button>
            <el-radio-button value="list">列表</el-radio-button>
          </el-radio-group>
          <el-select v-model="sortBy" size="small" style="margin-left: 12px; width: 110px">
            <el-option label="按姓名" value="name" />
            <el-option label="按部门" value="dept" />
            <el-option label="在线状态" value="status" />
          </el-select>
        </div>
        <div class="toolbar-right">
          <el-button :icon="Refresh" size="small" @click="loadData">刷新</el-button>
          <el-button v-if="canExport" type="success" :icon="Download" size="small" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：组织架构树 + 快捷分组 -->
      <div class="left-panel">
        <el-card shadow="never" class="tree-panel">
          <el-tree
              ref="treeRef"
              :data="orgTree"
              :props="treeProps"
              node-key="id"
              :expand-on-click-node="false"
              highlight-current
              @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon class="tree-icon"><OfficeBuilding /></el-icon>
                <span class="tree-label">{{ node.label }}</span>
                <el-tag v-if="data.count" size="small" type="info" effect="plain" class="node-count">{{ data.count }}</el-tag>
              </span>
            </template>
          </el-tree>

          <el-divider style="margin: 12px 0" />

          <div class="quick-groups">
            <div class="group-title">快捷分组</div>
            <div
                v-for="group in quickGroups"
                :key="group.key"
                class="group-item"
                :class="{ active: currentGroup === group.key }"
                @click="handleGroupClick(group.key)"
            >
              <el-icon><component :is="group.icon" /></el-icon>
              <span>{{ group.label }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中间：人员展示区 -->
      <div class="center-panel">
        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="card-view">
          <div v-if="filteredPeople.length === 0" class="empty-state">
            <el-empty description="暂无人员" :image-size="100" />
          </div>
          <div v-else class="people-grid">
            <div
                v-for="person in filteredPeople"
                :key="person.id"
                class="person-card"
                @click="showDetail(person)"
            >
              <div class="card-avatar">
                <el-avatar :size="56" class="avatar">{{ person.name[0] }}</el-avatar>
                <el-icon v-if="person.isFavorite" class="fav-icon" color="#f5d742" size="18">
                  <StarFilled />
                </el-icon>
              </div>
              <div class="card-info">
                <div class="info-name">{{ person.name }}</div>
                <div class="info-jobno">{{ person.jobNo }}</div>
                <div class="info-dept">{{ person.department }}</div>
                <div class="info-position">{{ person.position }}</div>
              </div>
              <div class="card-status">
                <el-tag :type="getStatusType(person.status)" size="small" effect="light">
                  {{ getStatusText(person.status) }}
                </el-tag>
              </div>
              <div class="card-actions" @click.stop>
                <el-tooltip content="发消息" placement="top">
                  <el-button link size="small" :icon="ChatDotRound" @click="handleMessage(person)" />
                </el-tooltip>
                <el-tooltip content="发起会议" placement="top">
                  <el-button link size="small" :icon="VideoCamera" @click="handleMeeting(person)" />
                </el-tooltip>
                <el-tooltip :content="person.isFavorite ? '取消收藏' : '添加常用'" placement="top">
                  <el-button
                      link
                      size="small"
                      :icon="person.isFavorite ? StarFilled : Star"
                      :class="{ favorited: person.isFavorite }"
                      @click="toggleFavorite(person)"
                  />
                </el-tooltip>
              </div>
            </div>
          </div>

          <div v-if="total > 0" class="pagination-wrap">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                small
            />
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="list-view">
          <el-table :data="filteredPeople" border stripe v-loading="loading">
            <el-table-column label="头像" width="60" align="center">
              <template #default="{ row }">
                <el-avatar :size="36" class="table-avatar">{{ row.name[0] }}</el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="jobNo" label="工号" width="100" />
            <el-table-column prop="department" label="部门" width="150" />
            <el-table-column prop="position" label="职位" width="120" />
            <el-table-column prop="phone" label="电话" width="130">
              <template #default="{ row }">{{ maskPhone(row.phone) }}</template>
            </el-table-column>
            <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="showDetail(row)">详情</el-button>
                <el-button link size="small" @click="toggleFavorite(row)">
                  {{ row.isFavorite ? '取消收藏' : '收藏' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右侧：字母导航 -->
      <div class="right-panel">
        <div class="alpha-nav">
          <div
              v-for="letter in alphabet"
              :key="letter"
              class="alpha-item"
              @click="scrollToLetter(letter)"
          >
            {{ letter }}
          </div>
        </div>
      </div>
    </div>

    <!-- 人员详情抽屉 -->
    <el-drawer
        v-model="drawerVisible"
        size="420px"
        :with-header="false"
        class="detail-drawer"
        :close-on-click-modal="false"
    >
      <div v-if="currentPerson" class="detail-wrapper">
        <!-- 头部背景 -->
        <div class="detail-header-bg">
          <div class="close-btn" @click="drawerVisible = false">
            <el-icon size="20"><Close /></el-icon>
          </div>
        </div>

        <!-- 个人信息卡片 -->
        <div class="profile-card">
          <div class="profile-avatar-wrap">
            <el-avatar :size="88" class="profile-avatar">{{ currentPerson.name[0] }}</el-avatar>
            <el-icon v-if="currentPerson.isFavorite" class="profile-fav" color="#f5d742" size="24">
              <StarFilled />
            </el-icon>
          </div>
          <div class="profile-name">{{ currentPerson.name }}</div>
          <div class="profile-position">{{ currentPerson.position }}</div>
          <div class="profile-dept">{{ currentPerson.fullDeptPath }}</div>
          <div class="profile-meta">
            <el-tag size="small" effect="light" class="meta-tag">
              工号：{{ currentPerson.jobNo }}
            </el-tag>
            <el-tag :type="getStatusType(currentPerson.status)" size="small" effect="light" class="meta-tag">
              {{ getStatusText(currentPerson.status) }}
            </el-tag>
          </div>
          <el-button
              class="add-fav-btn"
              :icon="currentPerson.isFavorite ? StarFilled : Star"
              :type="currentPerson.isFavorite ? 'warning' : 'primary'"
              plain
              size="small"
              @click="toggleFavorite(currentPerson)"
          >
            {{ currentPerson.isFavorite ? '已添加常用' : '添加常用联系人' }}
          </el-button>
        </div>

        <!-- 联系方式 -->
        <div class="detail-section">
          <div class="section-header">
            <el-icon class="section-icon"><Phone /></el-icon>
            <span class="section-title">联系方式</span>
          </div>
          <div class="contact-grid">
            <div class="contact-card">
              <div class="contact-icon-wrap phone-bg">
                <el-icon><Phone /></el-icon>
              </div>
              <div class="contact-info">
                <div class="contact-label">办公电话</div>
                <div class="contact-value">{{ currentPerson.officePhone }}</div>
              </div>
              <el-button link size="small" class="copy-btn" @click="copyText(currentPerson.officePhone)">复制</el-button>
            </div>
            <div class="contact-card">
              <div class="contact-icon-wrap mobile-bg">
                <el-icon><Iphone /></el-icon>
              </div>
              <div class="contact-info">
                <div class="contact-label">手机</div>
                <div class="contact-value">{{ maskPhone(currentPerson.phone) }}</div>
              </div>
              <el-button link size="small" class="copy-btn" @click="copyText(currentPerson.phone)">复制</el-button>
            </div>
            <div class="contact-card">
              <div class="contact-icon-wrap email-bg">
                <el-icon><Message /></el-icon>
              </div>
              <div class="contact-info">
                <div class="contact-label">邮箱</div>
                <div class="contact-value">{{ currentPerson.email }}</div>
              </div>
              <el-button link size="small" class="copy-btn" @click="copyText(currentPerson.email)">复制</el-button>
            </div>
          </div>
        </div>

        <!-- 快速协作 -->
        <div class="detail-section">
          <div class="section-header">
            <el-icon class="section-icon"><ChatDotRound /></el-icon>
            <span class="section-title">快速协作</span>
          </div>
          <div class="action-grid">
            <div class="action-card msg-card" @click="handleMessage(currentPerson)">
              <el-icon class="action-icon"><ChatDotRound /></el-icon>
              <span class="action-text">发送消息</span>
            </div>
            <div class="action-card meeting-card" @click="handleMeeting(currentPerson)">
              <el-icon class="action-icon"><VideoCamera /></el-icon>
              <span class="action-text">发起会议</span>
            </div>
            <div class="action-card schedule-card" @click="handleSchedule(currentPerson)">
              <el-icon class="action-icon"><Calendar /></el-icon>
              <span class="action-text">查看日程</span>
            </div>
          </div>
        </div>

        <!-- 其他信息 -->
        <div class="detail-section">
          <div class="section-header">
            <el-icon class="section-icon"><InfoFilled /></el-icon>
            <span class="section-title">其他信息</span>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">入职时间</span>
              <span class="info-value">{{ currentPerson.entryDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">企业微信</span>
              <span class="info-value">{{ currentPerson.wechat }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, Refresh, Download, OfficeBuilding, ChatDotRound, VideoCamera,
  Calendar, Close, Phone, Iphone, Message, Star, StarFilled, InfoFilled
} from '@element-plus/icons-vue'

const loading = ref(false)
const searchKeyword = ref('')
const viewMode = ref('card')
const sortBy = ref('name')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const drawerVisible = ref(false)
const currentPerson = ref(null)
const currentDept = ref('all')
const currentGroup = ref('')
const canExport = ref(true)

const orgTree = ref([
  {
    id: 1,
    label: '集团总部',
    count: 156,
    children: [
      { id: 11, label: '研发中心', count: 45 },
      { id: 12, label: '产品部', count: 28 },
      { id: 13, label: '市场部', count: 32 },
      { id: 14, label: '销售部', count: 38 },
      { id: 15, label: '人力资源部', count: 13 }
    ]
  }
])

const treeProps = { children: 'children', label: 'label' }

const quickGroups = ref([
  { key: 'favorites', label: '我的常用', icon: 'Star' },
  { key: 'leaders', label: '部门负责人', icon: 'UserFilled' },
  { key: 'online', label: '在线同事', icon: 'Connection' }
])

const allPeople = ref([
  {
    id: 1, name: '张三', jobNo: 'EMP001', department: '研发中心',
    fullDeptPath: '集团总部 / 研发中心', position: '前端工程师',
    phone: '13812345678', officePhone: '010-88886666',
    email: 'zhangsan@company.com', wechat: 'zhangsan',
    avatar: '', status: 'online', entryDate: '2023-03-15',
    isFavorite: false, firstLetter: 'Z'
  },
  {
    id: 2, name: '李四', jobNo: 'EMP002', department: '产品部',
    fullDeptPath: '集团总部 / 产品部', position: '产品经理',
    phone: '13987654321', officePhone: '010-88886667',
    email: 'lisi@company.com', wechat: 'lisi',
    avatar: '', status: 'busy', entryDate: '2022-06-20',
    isFavorite: true, firstLetter: 'L'
  },
  {
    id: 3, name: '王五', jobNo: 'EMP003', department: '市场部',
    fullDeptPath: '集团总部 / 市场部', position: '市场专员',
    phone: '13711112222', officePhone: '010-88886668',
    email: 'wangwu@company.com', wechat: 'wangwu',
    avatar: '', status: 'offline', entryDate: '2024-01-10',
    isFavorite: false, firstLetter: 'W'
  }
])

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const filteredPeople = computed(() => {
  let result = allPeople.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.department.toLowerCase().includes(keyword) ||
        p.jobNo.toLowerCase().includes(keyword)
    )
  }

  if (currentDept.value !== 'all') {
    result = result.filter(p => p.department.includes(currentDept.value))
  }

  if (currentGroup.value === 'favorites') {
    result = result.filter(p => p.isFavorite)
  } else if (currentGroup.value === 'online') {
    result = result.filter(p => p.status === 'online')
  }

  if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  } else if (sortBy.value === 'dept') {
    result.sort((a, b) => a.department.localeCompare(b.department, 'zh'))
  }

  total.value = result.length
  return result
})

const handleSearch = () => { currentPage.value = 1 }

const handleNodeClick = (data) => {
  currentDept.value = data.label
  currentGroup.value = ''
}

const handleGroupClick = (group) => {
  currentGroup.value = group
  currentDept.value = 'all'
}

const showDetail = (person) => {
  currentPerson.value = person
  drawerVisible.value = true
}

const toggleFavorite = (person) => {
  person.isFavorite = !person.isFavorite
  ElMessage.success(person.isFavorite ? '已添加到常用联系人' : '已取消收藏')
}

const handleMessage = (person) => {
  ElMessage.info(`给 ${person.name} 发送消息`)
}

const handleMeeting = (person) => {
  ElMessage.info(`邀请 ${person.name} 参会`)
}

const handleSchedule = (person) => {
  ElMessage.info(`查看 ${person.name} 的日程`)
}

const copyText = (text) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

const maskPhone = (phone) => {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const getStatusType = (status) => {
  const map = { online: 'success', busy: 'warning', offline: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { online: '在线', busy: '忙碌', offline: '离线' }
  return map[status] || '离线'
}

const scrollToLetter = (letter) => {
  ElMessage.info(`跳转到 ${letter}`)
}

const handleExport = () => {
  ElMessage.success('正在导出通讯录...')
}

const loadData = () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.employee-page {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f0f2f5;

  .toolbar-card {
    margin: 12px 16px 0;
    border-radius: 8px;

    :deep(.el-card__body) {
      padding: 12px 16px;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toolbar-left {
        display: flex;
        align-items: center;
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    gap: 12px;
    padding: 12px 16px 16px;
    overflow: hidden;

    .left-panel {
      width: 240px;
      flex-shrink: 0;

      .tree-panel {
        height: 100%;
        border-radius: 8px;
        overflow-y: auto;

        :deep(.el-card__body) {
          padding: 12px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        :deep(.el-tree) {
          background: transparent;
          flex: 1;
          overflow-y: auto;

          .el-tree-node__content {
            height: 32px;
            border-radius: 4px;
            margin-bottom: 2px;

            &:hover {
              background-color: #f5f7fa;
            }
          }

          .is-current > .el-tree-node__content {
            background-color: #ecf5ff;
            color: #409eff;
          }
        }

        .tree-node {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;

          .tree-icon {
            color: #409eff;
            font-size: 14px;
          }

          .tree-label {
            flex: 1;
            font-size: 13px;
          }

          .node-count {
            font-size: 11px;
          }
        }

        .quick-groups {
          flex-shrink: 0;

          .group-title {
            font-size: 12px;
            color: #909399;
            margin-bottom: 8px;
            padding-left: 4px;
            font-weight: 500;
          }

          .group-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 13px;
            color: #606266;
            margin-bottom: 2px;

            &:hover {
              background: #f5f7fa;
              color: #409eff;
            }

            &.active {
              background: #ecf5ff;
              color: #409eff;
              font-weight: 500;
            }

            .el-icon {
              font-size: 16px;
            }
          }
        }
      }
    }

    .center-panel {
      flex: 1;
      overflow-y: auto;
      background: #fff;
      border-radius: 8px;
      padding: 16px;

      .card-view {
        .people-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;

          .person-card {
            background: #fff;
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            padding: 20px 16px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;

            &:hover {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
              border-color: #409eff;
              transform: translateY(-2px);
            }

            .card-avatar {
              position: relative;
              display: inline-block;
              margin-bottom: 12px;

              .avatar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                font-size: 20px;
                font-weight: 500;
              }

              .fav-icon {
                position: absolute;
                top: -4px;
                right: -4px;
              }
            }

            .card-info {
              margin-bottom: 12px;

              .info-name {
                font-size: 16px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }

              .info-jobno {
                font-size: 12px;
                color: #909399;
                margin-bottom: 8px;
              }

              .info-dept {
                font-size: 13px;
                color: #606266;
                margin-bottom: 4px;
              }

              .info-position {
                font-size: 12px;
                color: #909399;
              }
            }

            .card-status {
              margin-bottom: 12px;
            }

            .card-actions {
              display: flex;
              justify-content: center;
              gap: 12px;
              padding-top: 12px;
              border-top: 1px solid #f0f0f0;

              .el-button {
                font-size: 18px;
                padding: 4px;

                &.favorited {
                  color: #e6a23c;
                }
              }
            }
          }
        }

        .pagination-wrap {
          margin-top: 20px;
          display: flex;
          justify-content: center;
        }
      }

      .list-view {
        .table-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 14px;
        }
      }
    }

    .right-panel {
      width: 32px;
      flex-shrink: 0;

      .alpha-nav {
        background: #fff;
        border-radius: 16px;
        padding: 8px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;

        .alpha-item {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #409eff;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s;

          &:hover {
            background: #ecf5ff;
            font-weight: 600;
          }
        }
      }
    }
  }

  .empty-state {
    padding: 80px 0;
  }

  // 抽屉样式
  :deep(.detail-drawer) {
    .el-drawer__body {
      padding: 0;
      background: #f5f7fa;
    }
  }

  .detail-wrapper {
    height: 100%;
    overflow-y: auto;

    .detail-header-bg {
      height: 120px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;

      .close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        cursor: pointer;
        color: #fff;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
      }
    }

    .profile-card {
      background: #fff;
      margin: -60px 16px 16px;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      position: relative;

      .profile-avatar-wrap {
        position: relative;
        display: inline-block;
        margin-bottom: 16px;

        .profile-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 32px;
          font-weight: 500;
          border: 4px solid #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .profile-fav {
          position: absolute;
          bottom: 0;
          right: 0;
        }
      }

      .profile-name {
        font-size: 22px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }

      .profile-position {
        font-size: 14px;
        color: #409eff;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .profile-dept {
        font-size: 13px;
        color: #606266;
        margin-bottom: 12px;
      }

      .profile-meta {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 16px;

        .meta-tag {
          font-size: 12px;
        }
      }

      .add-fav-btn {
        width: 100%;
        border-radius: 20px;
      }
    }

    .detail-section {
      background: #fff;
      margin: 0 16px 12px;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;

        .section-icon {
          font-size: 18px;
          color: #409eff;
        }

        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: #303133;
        }
      }

      .contact-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .contact-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            background: #ecf5ff;
          }

          .contact-icon-wrap {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #fff;
            flex-shrink: 0;

            &.phone-bg {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            &.mobile-bg {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            &.email-bg {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
          }

          .contact-info {
            flex: 1;
            min-width: 0;

            .contact-label {
              font-size: 11px;
              color: #909399;
              margin-bottom: 4px;
            }

            .contact-value {
              font-size: 14px;
              color: #303133;
              font-weight: 500;
            }
          }

          .copy-btn {
            flex-shrink: 0;
          }
        }
      }

      .action-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;

        .action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
          }

          .action-icon {
            font-size: 24px;
          }

          .action-text {
            font-size: 13px;
            font-weight: 500;
          }

          &.msg-card {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            color: #1976d2;

            &:hover {
              box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
            }
          }

          &.meeting-card {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            color: #388e3c;

            &:hover {
              box-shadow: 0 4px 12px rgba(56, 142, 60, 0.2);
            }
          }

          &.schedule-card {
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
            color: #f57c00;

            &:hover {
              box-shadow: 0 4px 12px rgba(245, 124, 0, 0.2);
            }
          }
        }
      }

      .info-list {
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            font-size: 13px;
            color: #909399;
          }

          .info-value {
            font-size: 13px;
            color: #303133;
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>
