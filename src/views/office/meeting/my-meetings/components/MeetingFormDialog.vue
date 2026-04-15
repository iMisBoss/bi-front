<template>
  <el-dialog
      :model-value="visible"
      @update:model-value="$emit('update:visible', $event)"
      :title="isEdit ? '编辑会议' : '创建会议'"
      width="700px"
      top="5vh"
      :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="会议标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入会议标题" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item label="会议类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择会议类型" style="width: 100%">
          <el-option label="部门例会" value="department" />
          <el-option label="项目会议" value="project" />
          <el-option label="全员大会" value="company" />
          <el-option label="线上会议" value="online" />
          <el-option label="涉密会议" value="secret" />
        </el-select>
      </el-form-item>
      <el-form-item label="会议时间" prop="timeRange">
        <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="会议地点" prop="locationType">
        <el-radio-group v-model="form.locationType">
          <el-radio label="offline">线下会议室</el-radio>
          <el-radio label="online">线上会议</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.locationType === 'offline'" label="会议室" prop="room">
        <el-select v-model="form.room" placeholder="请选择会议室" style="width: 100%">
          <el-option label="1号会议室（10人）" value="room1" />
          <el-option label="2号会议室（20人）" value="room2" />
          <el-option label="3号会议室（30人）" value="room3" />
          <el-option label="大会议室（50人）" value="big_room" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.locationType === 'online'" label="会议链接" prop="onlineUrl">
        <el-input v-model="form.onlineUrl" placeholder="请输入内网会议链接" />
      </el-form-item>
      <el-form-item label="参会人员" prop="attendees">
        <el-select v-model="form.attendees" placeholder="请选择参会人员" multiple style="width: 100%">
          <el-option label="张三 - 技术部" value="zhangsan" />
          <el-option label="李四 - 销售部" value="lisi" />
          <el-option label="王五 - 行政部" value="wangwu" />
          <el-option label="赵六 - 财务部" value="zhaoliu" />
        </el-select>
      </el-form-item>
      <el-form-item label="抄送人">
        <el-select v-model="form.ccUsers" placeholder="请选择抄送人" multiple style="width: 100%">
          <el-option label="孙七 - 人事部" value="sunqi" />
          <el-option label="周八 - 法务部" value="zhouba" />
        </el-select>
      </el-form-item>
      <el-form-item label="会议描述">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入会议议程、注意事项等" />
      </el-form-item>
      <el-form-item label="会议优先级">
        <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%">
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </el-form-item>
      <el-form-item label="重复设置">
        <el-select v-model="form.repeatType" placeholder="请选择重复方式" style="width: 100%">
          <el-option label="不重复" value="none" />
          <el-option label="每日" value="daily" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
        </el-select>
      </el-form-item>
      <el-form-item label="提醒设置">
        <el-select v-model="form.remindTime" placeholder="请选择提醒时间" style="width: 100%">
          <el-option label="不提醒" value="none" />
          <el-option label="提前10分钟" value="10min" />
          <el-option label="提前30分钟" value="30min" />
          <el-option label="提前1小时" value="1hour" />
          <el-option label="提前1天" value="1day" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, reactive, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  meeting: Object
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref(null)

const form = reactive({
  title: '',
  type: '',
  timeRange: [],
  locationType: 'offline',
  room: '',
  onlineUrl: '',
  attendees: [],
  ccUsers: [],
  description: '',
  priority: 'medium',
  repeatType: 'none',
  remindTime: '30min'
})

const rules = {
  title: [{ required: true, message: '请输入会议标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择会议类型', trigger: 'change' }],
  timeRange: [{ required: true, message: '请选择会议时间', trigger: 'change' }],
  locationType: [{ required: true, message: '请选择会议地点类型', trigger: 'change' }]
}

watch(() => props.meeting, (newVal) => {
  if (newVal && props.isEdit) {
    form.title = newVal.title
    form.type = newVal.type
    form.description = newVal.description
  }
}, { immediate: true })

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('submit')
    }
  })
}
</script>
