<template>
  <div class="room-drawer">
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        :disabled="mode === 'view'"
    >
      <el-form-item label="会议室名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入会议室名称" />
      </el-form-item>

      <el-form-item label="容纳人数" prop="capacity">
        <el-input-number
            v-model="formData.capacity"
            :min="1"
            :max="200"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="所在楼层" prop="floor">
        <el-input v-model="formData.floor" placeholder="例如：1楼、2楼A区" />
      </el-form-item>

      <el-form-item label="设备配置">
        <el-checkbox-group v-model="formData.equipment">
          <el-checkbox label="projector">投影仪</el-checkbox>
          <el-checkbox label="whiteboard">白板</el-checkbox>
          <el-checkbox label="video">视频会议</el-checkbox>
          <el-checkbox label="audio">音响</el-checkbox>
          <el-checkbox label="microphone">麦克风</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled">启用</el-radio>
          <el-radio label="disabled">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <div v-if="mode !== 'view'" class="drawer-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  roomData: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'add' // add, edit, view
  }
})

const emit = defineEmits(['save', 'close'])

const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  name: '',
  capacity: 10,
  floor: '',
  equipment: [],
  status: 'enabled',
  remark: ''
})

const rules = {
  name: [
    { required: true, message: '请输入会议室名称', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入容纳人数', trigger: 'blur' }
  ],
  floor: [
    { required: true, message: '请输入所在楼层', trigger: 'blur' }
  ]
}

const equipmentMap = {
  projector: '投影',
  whiteboard: '白板',
  video: '视频会议',
  audio: '音响',
  microphone: '麦克风'
}

watch(() => props.roomData, (newVal) => {
  if (newVal) {
    formData.name = newVal.name || ''
    formData.capacity = newVal.capacity || 10
    formData.floor = newVal.floor || ''
    formData.status = newVal.status || 'enabled'
    formData.remark = newVal.remark || ''

    // 解析设备信息
    if (newVal.equipment) {
      const equipList = newVal.equipment.split('、')
      formData.equipment = equipList.map(item => {
        return Object.keys(equipmentMap).find(key => equipmentMap[key] === item) || item
      })
    } else {
      formData.equipment = []
    }
  }
}, { immediate: true })

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true

      // 转换设备数据
      const equipmentText = formData.equipment
          .map(key => equipmentMap[key] || key)
          .join('、')

      const saveData = {
        ...formData,
        equipment: equipmentText
      }

      setTimeout(() => {
        saving.value = false
        emit('save', saveData)
      }, 500)
    }
  })
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.room-drawer {
  padding: 20px;

  .drawer-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  :deep(.el-checkbox-group) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
