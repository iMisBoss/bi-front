<template>
  <div class="create-meeting-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-icon :size="24" color="#409eff"><Calendar /></el-icon>
        <span class="page-title">发起会议</span>
      </div>
      <div class="header-right">
        <el-button @click="handleClose">关闭</el-button>
        <el-button @click="handleSaveDraft">
          <el-icon><DocumentCopy /></el-icon>
          保存草稿
        </el-button>
        <el-button @click="handlePreview">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          <el-icon><Promotion /></el-icon>
          提交会议
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 中间表单核心区 -->
      <div class="form-section">
        <el-form :model="meetingForm" :rules="rules" ref="formRef" label-width="120px" label-position="right">

          <!-- 第一区域：基础信息 -->
          <el-card shadow="never" class="form-card">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>基础信息</span>
                <span class="required-tip">* 为必填项</span>
              </div>
            </template>

            <el-form-item label="会议标题" prop="title">
              <el-input
                  v-model="meetingForm.title"
                  placeholder="请输入会议标题（如：2026年4月研发部周例会）"
                  maxlength="50"
                  show-word-limit
              >
                <template #append>
                  <el-button @click="showHistoryTitles = true">历史</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="会议类型" prop="type">
              <el-select v-model="meetingForm.type" placeholder="请选择会议类型" style="width: 100%">
                <el-option label="部门例会" value="department" />
                <el-option label="项目评审会" value="project" />
                <el-option label="客户会议" value="customer" />
                <el-option label="培训会议" value="training" />
                <el-option label="高管会议" value="executive" />
                <el-option label="涉密会议" value="secret" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="会议形式" prop="meetingFormat">
              <el-radio-group v-model="meetingForm.meetingFormat">
                <el-radio label="offline">线下会议</el-radio>
                <el-radio label="online">线上会议</el-radio>
                <el-radio label="hybrid">混合会议</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 线下/混合会议显示会议室选择 -->
            <el-form-item
                v-if="meetingForm.meetingFormat === 'offline' || meetingForm.meetingFormat === 'hybrid'"
                label="会议室"
                prop="roomId"
            >
              <el-button @click="showRoomSelector = true">
                <el-icon><OfficeBuilding /></el-icon>
                {{ meetingForm.roomName || '选择会议室' }}
              </el-button>
              <span v-if="meetingForm.roomName" style="margin-left: 12px; color: #909399; font-size: 12px">
                {{ meetingForm.roomCapacity }}人 | {{ meetingForm.roomLocation }}
              </span>
            </el-form-item>

            <!-- 线上/混合会议显示会议链接 -->
            <el-form-item
                v-if="meetingForm.meetingFormat === 'online' || meetingForm.meetingFormat === 'hybrid'"
                label="会议链接"
                prop="onlineUrl"
            >
              <el-input
                  v-model="meetingForm.onlineUrl"
                  placeholder="请输入内网会议链接（如：企业内网视频会议地址）"
              >
                <template #prepend>
                  <span>🎥</span>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="会议时间" prop="timeRange">
              <el-date-picker
                  v-model="meetingForm.timeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="发起部门" prop="department">
              <el-input v-model="meetingForm.department" disabled />
            </el-form-item>

            <el-form-item label="会议描述">
              <el-input
                  v-model="meetingForm.description"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入会议议程、注意事项、会议目标等（支持富文本）"
              />
              <div style="margin-top: 8px">
                <el-button size="small" @click="applyTemplate('meeting')">
                  套用会议描述模板
                </el-button>
              </div>
            </el-form-item>
          </el-card>

          <!-- 第二区域：参会信息 -->
          <el-card shadow="never" class="form-card">
            <template #header>
              <div class="card-header">
                <el-icon><UserFilled /></el-icon>
                <span>参会信息</span>
              </div>
            </template>

            <el-form-item label="参会人" prop="attendees">
              <el-button @click="showAttendeeSelector = true">
                <el-icon><User /></el-icon>
                选择参会人
              </el-button>
              <span style="margin-left: 12px; color: #409eff">
                已选择 {{ meetingForm.attendees.length }} 人
              </span>

              <!-- 已选参会人列表 -->
              <div v-if="meetingForm.attendees.length > 0" class="selected-list">
                <el-tag
                    v-for="attendee in meetingForm.attendees"
                    :key="attendee.id"
                    closable
                    :type="attendee.isRequired ? 'danger' : ''"
                    @close="removeAttendee(attendee)"
                    style="margin: 4px"
                >
                  {{ attendee.name }} - {{ attendee.department }}
                  <span v-if="attendee.isRequired" style="margin-left: 4px; color: #f56c6c">*</span>
                </el-tag>
              </div>

              <div style="margin-top: 8px; font-size: 12px; color: #909399">
                <el-icon><InfoFilled /></el-icon>
                标注 * 的参会人为必填参会人，提交后将反复提醒直至确认参会
              </div>
            </el-form-item>

            <el-form-item label="抄送人">
              <el-button @click="showCCSelector = true">
                <el-icon><Message /></el-icon>
                选择抄送人
              </el-button>
              <span style="margin-left: 12px; color: #409eff">
                已选择 {{ meetingForm.ccUsers.length }} 人
              </span>

              <div v-if="meetingForm.ccUsers.length > 0" class="selected-list">
                <el-tag
                    v-for="user in meetingForm.ccUsers"
                    :key="user.id"
                    closable
                    @close="removeCCUser(user)"
                    style="margin: 4px"
                >
                  {{ user.name }} - {{ user.department }}
                </el-tag>
              </div>

              <div style="margin-top: 8px; font-size: 12px; color: #909399">
                抄送人仅查看会议详情和接收纪要，无需确认参会
              </div>
            </el-form-item>

            <el-form-item label="会议主持人">
              <el-select
                  v-model="meetingForm.hostId"
                  placeholder="请选择主持人（默认当前用户）"
                  style="width: 100%"
                  clearable
              >
                <el-option
                    v-for="attendee in meetingForm.attendees"
                    :key="attendee.id"
                    :label="attendee.name + ' - ' + attendee.department"
                    :value="attendee.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="参会提醒">
              <el-select v-model="meetingForm.remindTime" placeholder="请选择提醒时间" style="width: 100%">
                <el-option label="不提醒" value="none" />
                <el-option label="提前10分钟" value="10min" />
                <el-option label="提前30分钟（默认）" value="30min" />
                <el-option label="提前1小时" value="1hour" />
                <el-option label="提前1天" value="1day" />
              </el-select>
            </el-form-item>
          </el-card>

          <!-- 第三区域：高级设置 -->
          <el-card shadow="never" class="form-card">
            <template #header>
              <div class="card-header" @click="showAdvanced = !showAdvanced" style="cursor: pointer">
                <el-icon><Setting /></el-icon>
                <span>高级设置</span>
                <el-icon :size="16" style="margin-left: auto">
                  <ArrowDown v-if="!showAdvanced" />
                  <ArrowUp v-else />
                </el-icon>
              </div>
            </template>

            <div v-show="showAdvanced">
              <el-form-item label="重复会议">
                <el-select v-model="meetingForm.repeatType" placeholder="请选择重复方式" style="width: 100%">
                  <el-option label="单次会议（默认）" value="none" />
                  <el-option label="每日" value="daily" />
                  <el-option label="每周" value="weekly" />
                  <el-option label="每月" value="monthly" />
                  <el-option label="自定义" value="custom" />
                </el-select>
              </el-form-item>

              <el-form-item label="重复结束" v-if="meetingForm.repeatType !== 'none'">
                <el-radio-group v-model="meetingForm.repeatEndType">
                  <el-radio label="count">重复N次</el-radio>
                  <el-radio label="date">至指定日期</el-radio>
                </el-radio-group>
                <el-input-number
                    v-if="meetingForm.repeatEndType === 'count'"
                    v-model="meetingForm.repeatCount"
                    :min="1"
                    :max="100"
                    style="margin-left: 12px; width: 120px"
                />
                <el-date-picker
                    v-if="meetingForm.repeatEndType === 'date'"
                    v-model="meetingForm.repeatEndDate"
                    type="date"
                    placeholder="选择结束日期"
                    style="margin-left: 12px; width: 200px"
                />
                <el-checkbox v-model="meetingForm.skipHolidays" style="margin-left: 12px">
                  跳过节假日
                </el-checkbox>
              </el-form-item>

              <el-form-item label="会议优先级">
                <el-select v-model="meetingForm.priority" placeholder="请选择优先级" style="width: 100%">
                  <el-option label="高" value="high" />
                  <el-option label="中（默认）" value="medium" />
                  <el-option label="低" value="low" />
                </el-select>
              </el-form-item>

              <el-form-item label="签到设置">
                <el-switch v-model="meetingForm.requireCheckin" />
                <span style="margin-left: 12px; color: #909399; font-size: 12px">
                  开启后参会人需在线签到
                </span>
              </el-form-item>

              <el-form-item label="签到时间" v-if="meetingForm.requireCheckin">
                <el-time-picker
                    v-model="meetingForm.checkinStartTime"
                    placeholder="签到开始时间"
                    style="width: 150px"
                />
                <span style="margin: 0 8px">至</span>
                <el-time-picker
                    v-model="meetingForm.checkinEndTime"
                    placeholder="签到结束时间"
                    style="width: 150px"
                />
              </el-form-item>

              <el-form-item label="纪要负责人">
                <el-select
                    v-model="meetingForm.minutesOwner"
                    placeholder="默认发起者"
                    style="width: 100%"
                    clearable
                >
                  <el-option
                      v-for="attendee in meetingForm.attendees"
                      :key="attendee.id"
                      :label="attendee.name + ' - ' + attendee.department"
                      :value="attendee.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="纪要提交时限">
                <el-input-number
                    v-model="meetingForm.minutesDeadline"
                    :min="1"
                    :max="7"
                    style="width: 120px"
                />
                <span style="margin-left: 8px">天内提交</span>
              </el-form-item>

              <el-form-item label="纪要可见范围">
                <el-select v-model="meetingForm.minutesVisibility" placeholder="请选择" style="width: 100%">
                  <el-option label="仅参会人可见（默认）" value="attendees" />
                  <el-option label="部门可见" value="department" />
                  <el-option label="全公司可见" value="company" />
                  <el-option label="指定人员可见" value="custom" />
                </el-select>
              </el-form-item>

              <el-form-item label="跨天设置">
                <el-checkbox v-model="meetingForm.allowCrossDay">
                  允许跨天（默认禁止）
                </el-checkbox>
              </el-form-item>

              <!-- 涉密设置（仅高管/管理员可见） -->
              <el-form-item label="涉密设置" v-if="isAdmin || isExecutive">
                <el-switch v-model="meetingForm.isSecret" />
                <span style="margin-left: 12px; color: #f56c6c; font-size: 12px">
                  涉密会议仅指定参会人可见，信息加密存储
                </span>
              </el-form-item>
            </div>
          </el-card>

          <!-- 第四区域：关联资源 -->
          <el-card shadow="never" class="form-card">
            <template #header>
              <div class="card-header" @click="showResources = !showResources" style="cursor: pointer">
                <el-icon><Connection /></el-icon>
                <span>关联资源</span>
                <el-icon :size="16" style="margin-left: auto">
                  <ArrowDown v-if="!showResources" />
                  <ArrowUp v-else />
                </el-icon>
              </div>
            </template>

            <div v-show="showResources">
              <el-form-item label="日程关联">
                <el-switch v-model="meetingForm.syncToCalendar" />
                <span style="margin-left: 12px; color: #909399; font-size: 12px">
                  开启后自动同步至所有参会人日程
                </span>
              </el-form-item>

              <el-form-item label="附件上传">
                <el-upload
                    action="#"
                    :auto-upload="false"
                    :on-change="handleFileChange"
                    :on-remove="handleFileRemove"
                    :file-list="fileList"
                    multiple
                    :limit="5"
                >
                  <el-button size="small" type="primary">
                    <el-icon><Upload /></el-icon>
                    选择文件
                  </el-button>
                  <template #tip>
                    <div style="font-size: 12px; color: #909399">
                      支持Word、Excel、PDF、图片等格式，单文件最大20M，最多5个文件
                    </div>
                  </template>
                </el-upload>
              </el-form-item>

              <el-form-item label="设备需求" v-if="meetingForm.meetingFormat === 'offline' || meetingForm.meetingFormat === 'hybrid'">
                <el-checkbox-group v-model="meetingForm.equipments">
                  <el-checkbox label="projector">投影仪</el-checkbox>
                  <el-checkbox label="mic">无线麦</el-checkbox>
                  <el-checkbox label="video">视频会议设备</el-checkbox>
                  <el-checkbox label="whiteboard">白板</el-checkbox>
                  <el-checkbox label="live">直播设备</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </div>
          </el-card>
        </el-form>
      </div>

      <!-- 右侧辅助栏 -->
      <div class="sidebar">
        <!-- 会议模板选择 -->
        <el-card shadow="never" class="sidebar-card">
          <template #header>
            <div class="card-title">
              <el-icon><Collection /></el-icon>
              <span>会议模板</span>
            </div>
          </template>
          <div class="template-list">
            <div
                v-for="template in templates"
                :key="template.id"
                class="template-item"
                @click="applyTemplate(template.id)"
            >
              <div class="template-name">{{ template.name }}</div>
              <div class="template-desc">{{ template.description }}</div>
            </div>
          </div>
        </el-card>

        <!-- 常见问题 -->
        <el-card shadow="never" class="sidebar-card">
          <template #header>
            <div class="card-title">
              <el-icon><QuestionFilled /></el-icon>
              <span>常见问题</span>
            </div>
          </template>
          <div class="faq-list">
            <div
                v-for="faq in faqs"
                :key="faq.id"
                class="faq-item"
                @click="faq.expanded = !faq.expanded"
            >
              <div class="faq-question">
                <span>{{ faq.question }}</span>
                <el-icon :size="16">
                  <ArrowDown v-if="!faq.expanded" />
                  <ArrowUp v-else />
                </el-icon>
              </div>
              <div v-if="faq.expanded" class="faq-answer">
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </el-card>

        <!-- 快捷操作 -->
        <el-card shadow="never" class="sidebar-card">
          <template #header>
            <div class="card-title">
              <el-icon><Operation /></el-icon>
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button
                style="width: 100%; margin-bottom: 8px"
                @click="handleSyncToCalendar"
            >
              <el-icon><Calendar /></el-icon>
              关联我的日程
            </el-button>
            <el-button
                v-if="isAdmin || isDepartmentHead"
                style="width: 100%; margin-bottom: 8px"
                @click="handleBatchImport"
            >
              <el-icon><Upload /></el-icon>
              批量导入参会人
            </el-button>
            <el-button
                style="width: 100%"
                @click="handleViewRoomBooking"
            >
              <el-icon><OfficeBuilding /></el-icon>
              查看会议室占用
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 会议室选择弹窗 -->
    <el-dialog
        v-model="showRoomSelector"
        title="选择会议室"
        width="900px"
        top="5vh"
    >
      <div class="room-selector">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-select v-model="roomFilter.floor" placeholder="楼层" clearable style="width: 120px">
            <el-option label="1楼" value="1F" />
            <el-option label="2楼" value="2F" />
            <el-option label="3楼" value="3F" />
          </el-select>
          <el-select v-model="roomFilter.capacity" placeholder="容量" clearable style="width: 120px; margin-left: 8px">
            <el-option label="5人内" value="5" />
            <el-option label="6-10人" value="10" />
            <el-option label="11-20人" value="20" />
            <el-option label="20人以上" value="30" />
          </el-select>
          <el-checkbox-group v-model="roomFilter.equipments" style="margin-left: 16px">
            <el-checkbox label="projector">投影仪</el-checkbox>
            <el-checkbox label="video">视频会议</el-checkbox>
            <el-checkbox label="whiteboard">白板</el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 会议室列表 -->
        <el-table :data="filteredRooms" border style="margin-top: 16px">
          <el-table-column label="选择" width="60" align="center">
            <template #default="{ row }">
              <el-radio
                  v-model="selectedRoomId"
                  :label="row.id"
                  :disabled="row.status === 'occupied' || row.status === 'maintenance'"
              />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="会议室名称" width="150" />
          <el-table-column prop="capacity" label="容纳人数" width="100" align="center" />
          <el-table-column prop="location" label="位置" width="120" />
          <el-table-column label="设备" min-width="200">
            <template #default="{ row }">
              <el-tag
                  v-for="eq in row.equipments"
                  :key="eq"
                  size="small"
                  type="info"
                  style="margin-right: 4px"
              >
                {{ eq }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getRoomStatusType(row.status)" size="small">
                {{ getRoomStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showRoomSelector = false">取消</el-button>
        <el-button type="primary" @click="confirmRoomSelection">确认选择</el-button>
      </template>
    </el-dialog>

    <!-- 参会人选择弹窗 -->
    <el-dialog
        v-model="showAttendeeSelector"
        title="选择参会人"
        width="800px"
        top="5vh"
    >
      <div class="attendee-selector">
        <el-input
            v-model="attendeeSearch"
            placeholder="搜索人员姓名/部门"
            prefix-icon="Search"
            style="margin-bottom: 16px"
        />
        <el-table :data="filteredAttendees" border max-height="400">
          <el-table-column label="选择" width="60" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.selected" />
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="100">
            <template #default="{ row }">
              {{ row.name }}
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="position" label="职位" width="120" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'online' ? 'success' : 'info'" size="small">
                {{ row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="120" align="center">
            <template #default="{ row }">
              <el-radio-group v-model="row.attendeeType" size="small">
                <el-radio-button label="required">必填</el-radio-button>
                <el-radio-button label="optional">普通</el-radio-button>
              </el-radio-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showAttendeeSelector = false">取消</el-button>
        <el-button type="primary" @click="confirmAttendeeSelection">确认选择</el-button>
      </template>
    </el-dialog>

    <!-- 抄送人选择弹窗 -->
    <el-dialog
        v-model="showCCSelector"
        title="选择抄送人"
        width="800px"
        top="5vh"
    >
      <div class="cc-selector">
        <el-input
            v-model="ccSearch"
            placeholder="搜索人员姓名/部门"
            prefix-icon="Search"
            style="margin-bottom: 16px"
        />
        <el-table :data="filteredCCUsers" border max-height="400">
          <el-table-column label="选择" width="60" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.selected" />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="position" label="职位" width="120" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showCCSelector = false">取消</el-button>
        <el-button type="primary" @click="confirmCCSelection">确认选择</el-button>
      </template>
    </el-dialog>

    <!-- 历史标题弹窗 -->
    <el-dialog
        v-model="showHistoryTitles"
        title="历史会议标题"
        width="600px"
    >
      <div class="history-list">
        <div
            v-for="title in historyTitles"
            :key="title"
            class="history-item"
            @click="meetingForm.title = title; showHistoryTitles = false"
        >
          {{ title }}
        </div>
      </div>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog
        v-model="showPreview"
        title="会议预览"
        width="800px"
        top="5vh"
    >
      <div class="preview-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="会议标题" :span="2">{{ meetingForm.title }}</el-descriptions-item>
          <el-descriptions-item label="会议类型">{{ getTypeName(meetingForm.type) }}</el-descriptions-item>
          <el-descriptions-item label="会议形式">{{ getFormatName(meetingForm.meetingFormat) }}</el-descriptions-item>
          <el-descriptions-item label="会议时间" :span="2">
            {{ formatTimeRange(meetingForm.timeRange) }}
          </el-descriptions-item>
          <el-descriptions-item label="会议室" v-if="meetingForm.roomName">{{ meetingForm.roomName }}</el-descriptions-item>
          <el-descriptions-item label="会议链接" v-if="meetingForm.onlineUrl">{{ meetingForm.onlineUrl }}</el-descriptions-item>
          <el-descriptions-item label="参会人数" :span="2">{{ meetingForm.attendees.length }} 人</el-descriptions-item>
          <el-descriptions-item label="会议描述" :span="2">
            <div style="white-space: pre-wrap">{{ meetingForm.description }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px">
          <h4>参会人列表</h4>
          <el-tag
              v-for="attendee in meetingForm.attendees"
              :key="attendee.id"
              :type="attendee.isRequired ? 'danger' : ''"
              style="margin: 4px"
          >
            {{ attendee.name }} - {{ attendee.department }}
            <span v-if="attendee.isRequired" style="margin-left: 4px">*</span>
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="showPreview = false">关闭</el-button>
        <el-button type="primary" @click="handleSubmit">提交会议</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar, DocumentCopy, View, Promotion, InfoFilled, UserFilled,
  Setting, Connection, Upload, Collection, QuestionFilled, Operation,
  ArrowDown, ArrowUp, User, Message, OfficeBuilding, Search
} from '@element-plus/icons-vue'

// 角色权限
const isAdmin = ref(true)
const isExecutive = ref(false)
const isDepartmentHead = ref(true)

const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const meetingForm = reactive({
  title: '',
  type: '',
  meetingFormat: 'offline',
  roomId: '',
  roomName: '',
  roomCapacity: '',
  roomLocation: '',
  onlineUrl: '',
  timeRange: [],
  department: '技术部',
  description: '',
  attendees: [],
  ccUsers: [],
  hostId: '',
  remindTime: '30min',
  repeatType: 'none',
  repeatEndType: 'count',
  repeatCount: 1,
  repeatEndDate: '',
  skipHolidays: false,
  priority: 'medium',
  requireCheckin: false,
  checkinStartTime: '',
  checkinEndTime: '',
  minutesOwner: '',
  minutesDeadline: 1,
  minutesVisibility: 'attendees',
  allowCrossDay: false,
  isSecret: false,
  syncToCalendar: true,
  equipments: []
})

const rules = {
  title: [{ required: true, message: '请输入会议标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择会议类型', trigger: 'change' }],
  meetingFormat: [{ required: true, message: '请选择会议形式', trigger: 'change' }],
  timeRange: [{ required: true, message: '请选择会议时间', trigger: 'change' }],
  department: [{ required: true, message: '请选择发起部门', trigger: 'change' }],
  attendees: [
    {
      required: true,
      message: '请选择至少1位参会人',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (value.length === 0) {
          callback(new Error('请选择至少1位参会人'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 会议室数据
const rooms = ref([
  {
    id: 'room101',
    name: '会议室-101',
    capacity: 10,
    location: '1楼东侧',
    status: 'available',
    floor: '1F',
    equipments: ['投影仪', '白板']
  },
  {
    id: 'room201',
    name: '技术部会议室',
    capacity: 15,
    location: '2楼201',
    status: 'occupied',
    floor: '2F',
    equipments: ['投影仪', '白板', '无线麦']
  },
  {
    id: 'room301',
    name: '大报告厅',
    capacity: 50,
    location: '3楼东侧',
    status: 'available',
    floor: '3F',
    equipments: ['投影仪', '视频会议', '直播设备', '无线麦']
  }
])

const roomFilter = reactive({
  floor: '',
  capacity: '',
  equipments: []
})

const showRoomSelector = ref(false)
const selectedRoomId = ref('')

const filteredRooms = computed(() => {
  let result = rooms.value
  if (roomFilter.floor) {
    result = result.filter(r => r.floor === roomFilter.floor)
  }
  if (roomFilter.capacity) {
    const cap = parseInt(roomFilter.capacity)
    result = result.filter(r => {
      if (cap === 5) return r.capacity <= 5
      if (cap === 10) return r.capacity > 5 && r.capacity <= 10
      if (cap === 20) return r.capacity > 10 && r.capacity <= 20
      return r.capacity > 20
    })
  }
  return result
})

// 参会人数据
const allAttendees = ref([
  { id: 'u1', name: '张三', department: '技术部', position: '前端工程师', status: 'online', selected: false, attendeeType: 'optional' },
  { id: 'u2', name: '李四', department: '技术部', position: '后端工程师', status: 'online', selected: false, attendeeType: 'optional' },
  { id: 'u3', name: '王五', department: '产品部', position: '产品经理', status: 'offline', selected: false, attendeeType: 'optional' },
  { id: 'u4', name: '赵六', department: '销售部', position: '销售经理', status: 'online', selected: false, attendeeType: 'optional' },
  { id: 'u5', name: '孙七', department: '行政部', position: '行政专员', status: 'online', selected: false, attendeeType: 'optional' }
])

const showAttendeeSelector = ref(false)
const attendeeSearch = ref('')

const filteredAttendees = computed(() => {
  if (!attendeeSearch.value) return allAttendees.value
  const keyword = attendeeSearch.value.toLowerCase()
  return allAttendees.value.filter(u =>
      u.name.toLowerCase().includes(keyword) ||
      u.department.toLowerCase().includes(keyword)
  )
})

const showCCSelector = ref(false)
const ccSearch = ref('')
const filteredCCUsers = computed(() => {
  if (!ccSearch.value) return allAttendees.value
  const keyword = ccSearch.value.toLowerCase()
  return allAttendees.value.filter(u =>
      u.name.toLowerCase().includes(keyword) ||
      u.department.toLowerCase().includes(keyword)
  )
})

// 其他状态
const showAdvanced = ref(false)
const showResources = ref(false)
const showHistoryTitles = ref(false)
const showPreview = ref(false)
const fileList = ref([])

const historyTitles = ref([
  '2026年4月技术部周例会',
  'Q2产品需求评审会',
  '新员工培训会议',
  '年度总结大会'
])

// 模板数据
const templates = ref([
  { id: 't1', name: '部门例会模板', description: '每周固定时间召开，包含工作汇报、问题讨论' },
  { id: 't2', name: '项目评审会模板', description: '包含需求评审、技术方案、风险评估' },
  { id: 't3', name: '培训会议模板', description: '包含培训主题、讲师、培训材料' },
  { id: 't4', name: '高管会议模板', description: '包含高管专属议题、涉密信息' }
])

// FAQ数据
const faqs = ref([
  { id: 1, question: '如何关联会议室？', answer: '在"基础信息"中选择"线下会议"或"混合会议"，点击"选择会议室"按钮即可。', expanded: false },
  { id: 2, question: '必填参会人如何设置？', answer: '在选择参会人弹窗中，勾选"必填"即可设置为必填参会人，提交后会反复提醒直至确认。', expanded: false },
  { id: 3, question: '重复会议如何取消？', answer: '取消时可选择"取消单次会议"或"取消所有重复会议"，避免误操作。', expanded: false }
])

onMounted(() => {
  // 初始化数据
})

const handleClose = () => {
  ElMessageBox.confirm('是否保存为草稿？', '提示', {
    confirmButtonText: '保存草稿',
    cancelButtonText: '不保存',
    distinguishCancelAndClose: true,
    type: 'warning'
  }).then(() => {
    handleSaveDraft()
  }).catch((action) => {
    if (action === 'cancel') {
      // 关闭页面
    }
  })
}

const handleSaveDraft = () => {
  ElMessage.success('草稿已保存')
}

const handlePreview = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      showPreview.value = true
    } else {
      ElMessage.warning('请完善必填信息后再预览')
    }
  })
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        ElMessage.success('会议创建成功')
        submitting.value = false
      }, 1000)
    }
  })
}

const handleFileChange = (file, files) => {
  fileList.value = files
}

const handleFileRemove = (file, files) => {
  fileList.value = files
}

const confirmRoomSelection = () => {
  const room = rooms.value.find(r => r.id === selectedRoomId.value)
  if (room) {
    meetingForm.roomId = room.id
    meetingForm.roomName = room.name
    meetingForm.roomCapacity = room.capacity
    meetingForm.roomLocation = room.location
    ElMessage.success('会议室选择成功')
  }
  showRoomSelector.value = false
}

const confirmAttendeeSelection = () => {
  meetingForm.attendees = allAttendees.value
      .filter(u => u.selected)
      .map(u => ({
        id: u.id,
        name: u.name,
        department: u.department,
        isRequired: u.attendeeType === 'required'
      }))
  ElMessage.success(`已选择 ${meetingForm.attendees.length} 位参会人`)
  showAttendeeSelector.value = false
}

const confirmCCSelection = () => {
  meetingForm.ccUsers = allAttendees.value
      .filter(u => u.selected)
      .map(u => ({
        id: u.id,
        name: u.name,
        department: u.department
      }))
  ElMessage.success(`已选择 ${meetingForm.ccUsers.length} 位抄送人`)
  showCCSelector.value = false
}

const removeAttendee = (attendee) => {
  meetingForm.attendees = meetingForm.attendees.filter(a => a.id !== attendee.id)
}

const removeCCUser = (user) => {
  meetingForm.ccUsers = meetingForm.ccUsers.filter(u => u.id !== user.id)
}

const applyTemplate = (templateId) => {
  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    if (templateId === 'meeting') {
      meetingForm.description = '会议议程：\n1. 上周工作回顾\n2. 本周工作计划\n3. 问题讨论\n4. 其他事项'
    } else if (template.id === 't1') {
      meetingForm.type = 'department'
      meetingForm.description = '会议议程：\n1. 上周工作回顾\n2. 本周工作计划\n3. 问题讨论'
    } else if (template.id === 't2') {
      meetingForm.type = 'project'
      meetingForm.description = '会议议程：\n1. 需求评审\n2. 技术方案讨论\n3. 风险评估'
    }
    ElMessage.success('模板应用成功')
  }
}

const handleSyncToCalendar = () => {
  meetingForm.syncToCalendar = true
  ElMessage.success('已关联我的日程')
}

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中')
}

const handleViewRoomBooking = () => {
  ElMessage.info('跳转至会议室预约页面')
}

const getRoomStatusType = (status) => {
  const types = {
    available: 'success',
    occupied: 'warning',
    maintenance: 'info'
  }
  return types[status] || 'info'
}

const getRoomStatusText = (status) => {
  const texts = {
    available: '可预约',
    occupied: '已占用',
    maintenance: '维护中'
  }
  return texts[status] || '未知'
}

const getTypeName = (type) => {
  const names = {
    department: '部门例会',
    project: '项目评审会',
    customer: '客户会议',
    training: '培训会议',
    executive: '高管会议',
    secret: '涉密会议',
    other: '其他'
  }
  return names[type] || type
}

const getFormatName = (format) => {
  const names = {
    offline: '线下会议',
    online: '线上会议',
    hybrid: '混合会议'
  }
  return names[format] || format
}

const formatTimeRange = (timeRange) => {
  if (!timeRange || timeRange.length !== 2) return ''
  return `${timeRange[0].toLocaleString()} 至 ${timeRange[1].toLocaleString()}`
}
</script>

<style lang="scss" scoped>
.create-meeting-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px 24px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .page-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .header-right {
      display: flex;
      gap: 8px;
    }
  }

  .main-content {
    display: flex;
    gap: 16px;

    .form-section {
      flex: 1;

      .form-card {
        margin-bottom: 16px;

        :deep(.el-card__header) {
          padding: 12px 20px;
          background: #fafafa;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #303133;

          .required-tip {
            font-size: 12px;
            color: #909399;
            font-weight: normal;
            margin-left: auto;
          }
        }

        .selected-list {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
        }
      }
    }

    .sidebar {
      width: 300px;

      .sidebar-card {
        margin-bottom: 16px;

        :deep(.el-card__header) {
          padding: 12px 16px;
          background: #fafafa;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }

        .template-list {
          .template-item {
            padding: 12px;
            margin-bottom: 8px;
            background: #f5f7fa;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              background: #ecf5ff;
              border: 1px solid #409eff;
            }

            .template-name {
              font-weight: 600;
              margin-bottom: 4px;
            }

            .template-desc {
              font-size: 12px;
              color: #909399;
            }
          }
        }

        .faq-list {
          .faq-item {
            padding: 12px;
            margin-bottom: 8px;
            background: #f5f7fa;
            border-radius: 4px;
            cursor: pointer;

            .faq-question {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 13px;
              font-weight: 600;
              color: #303133;
            }

            .faq-answer {
              margin-top: 8px;
              font-size: 12px;
              color: #606266;
              line-height: 1.6;
            }
          }
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }
    }
  }

  .room-selector,
  .attendee-selector,
  .cc-selector {
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .history-list {
    .history-item {
      padding: 12px;
      margin-bottom: 8px;
      background: #f5f7fa;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #ecf5ff;
        color: #409eff;
      }
    }
  }

  .preview-content {
    h4 {
      margin-bottom: 12px;
      color: #303133;
    }
  }
}
</style>
