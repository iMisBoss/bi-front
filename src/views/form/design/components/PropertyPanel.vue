<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3 class="panel-title">属性配置</h3>
    </div>
    <div class="panel-content">
      <div v-if="activeField" class="property-body">
        <el-tabs v-model="activeTab">
          <!-- Tab1：基础属性 -->
          <el-tab-pane label="基础属性" name="basic">
            <el-form :model="activeField" label-width="90px" size="small">
              <!-- 控件名称 -->
              <el-form-item label="控件名称">
                <el-input v-model="activeField.label" placeholder="请输入控件名称" />
              </el-form-item>

              <!-- 字段编码 -->
              <el-form-item label="字段编码">
                <el-input
                    v-model="activeField.code"
                    :disabled="!!activeField._codeLocked"
                    placeholder="请输入字段编码"
                />
                <div class="form-tip">
                  <el-icon><QuestionFilled /></el-icon>
                  {{ activeField._codeLocked ? '已锁定，不可修改' : '首次创建时可修改，保存后自动锁定' }}
                </div>
              </el-form-item>

              <!-- 占位提示 -->
              <el-form-item label="占位提示" v-if="showPlaceholder">
                <el-input v-model="activeField.props.placeholder" placeholder="请输入占位提示" />
              </el-form-item>

              <!-- 默认值 -->
              <el-form-item label="默认值" v-if="showDefaultValue">
                <el-select
                    v-model="activeField.props.defaultValueType"
                    placeholder="默认值类型"
                    style="width: 100%; margin-bottom: 8px"
                >
                  <el-option label="固定值" value="fixed" />
                  <el-option label="系统变量" value="system" />
                  <el-option label="表单变量" value="form" />
                  <el-option label="其他字段值" value="field" />
                </el-select>
                <template v-if="activeField.props.defaultValueType === 'fixed'">
                  <el-input v-model="activeField.props.defaultValue" placeholder="请输入默认值" />
                </template>
                <template v-else-if="activeField.props.defaultValueType === 'system'">
                  <el-select v-model="activeField.props.defaultValue" placeholder="选择系统变量" style="width: 100%">
                    <el-option label="当前用户" value="currentUser" />
                    <el-option label="当前时间" value="currentTime" />
                    <el-option label="当前部门" value="currentDept" />
                    <el-option label="当前岗位" value="currentPosition" />
                  </el-select>
                </template>
                <template v-else-if="activeField.props.defaultValueType === 'field'">
                  <el-select v-model="activeField.props.defaultValue" placeholder="选择字段" style="width: 100%">
                    <el-option
                        v-for="field in allFields"
                        :key="field.code"
                        :label="field.label"
                        :value="field.code"
                    />
                  </el-select>
                </template>
              </el-form-item>

              <!-- 标签位置（部分控件支持） -->
              <el-form-item label="标签位置" v-if="showLabelPosition">
                <el-radio-group v-model="activeField.props.labelPosition">
                  <el-radio label="left">左侧</el-radio>
                  <el-radio label="top">顶部</el-radio>
                </el-radio-group>
              </el-form-item>

              <!-- 控件宽度 -->
              <el-form-item label="控件宽度">
                <el-select v-model="activeField.props.width" style="width: 100%">
                  <el-option label="100%" value="100%" />
                  <el-option label="75%" value="75%" />
                  <el-option label="50%" value="50%" />
                  <el-option label="33%" value="33%" />
                  <el-option label="25%" value="25%" />
                  <el-option label="自定义" value="custom" />
                </el-select>
                <el-input
                    v-if="activeField.props.width === 'custom'"
                    v-model="activeField.props.customWidth"
                    placeholder="如：200px"
                    style="margin-top: 8px"
                />
              </el-form-item>

              <!-- 必填（支持条件必填） -->
              <el-form-item label="是否必填">
                <el-switch v-model="activeField.required" />
              </el-form-item>
              <el-form-item label="条件必填" v-if="!activeField.required">
                <el-switch v-model="activeField.conditionalRequired" />
                <div v-if="activeField.conditionalRequired" class="condition-config">
                  <el-select v-model="activeField.requiredCondition.field" placeholder="选择条件字段" style="width: 100%; margin-bottom: 8px">
                    <el-option
                        v-for="field in allFields"
                        :key="field.code"
                        :label="field.label"
                        :value="field.code"
                    />
                  </el-select>
                  <el-select v-model="activeField.requiredCondition.operator" placeholder="条件" style="width: 100%; margin-bottom: 8px">
                    <el-option label="等于" value="eq" />
                    <el-option label="不等于" value="neq" />
                    <el-option label="包含" value="contains" />
                  </el-select>
                  <el-input v-model="activeField.requiredCondition.value" placeholder="条件值" />
                </div>
              </el-form-item>

              <!-- 只读（支持条件只读） -->
              <el-form-item label="是否只读">
                <el-switch v-model="activeField.readonly" :disabled="activeField.sys" />
              </el-form-item>
              <el-form-item label="条件只读" v-if="!activeField.readonly && !activeField.sys">
                <el-switch v-model="activeField.conditionalReadonly" />
                <div v-if="activeField.conditionalReadonly" class="condition-config">
                  <el-select v-model="activeField.readonlyCondition.field" placeholder="选择条件字段" style="width: 100%; margin-bottom: 8px">
                    <el-option
                        v-for="field in allFields"
                        :key="field.code"
                        :label="field.label"
                        :value="field.code"
                    />
                  </el-select>
                  <el-select v-model="activeField.readonlyCondition.operator" placeholder="条件" style="width: 100%; margin-bottom: 8px">
                    <el-option label="等于" value="eq" />
                    <el-option label="不等于" value="neq" />
                  </el-select>
                  <el-input v-model="activeField.readonlyCondition.value" placeholder="条件值" />
                </div>
              </el-form-item>

              <!-- 隐藏（支持条件隐藏） -->
              <el-form-item label="是否隐藏">
                <el-switch v-model="activeField.hidden" />
              </el-form-item>
              <el-form-item label="条件隐藏" v-if="!activeField.hidden">
                <el-switch v-model="activeField.conditionalHidden" />
                <div v-if="activeField.conditionalHidden" class="condition-config">
                  <el-select v-model="activeField.hiddenCondition.field" placeholder="选择条件字段" style="width: 100%; margin-bottom: 8px">
                    <el-option
                        v-for="field in allFields"
                        :key="field.code"
                        :label="field.label"
                        :value="field.code"
                    />
                  </el-select>
                  <el-select v-model="activeField.hiddenCondition.operator" placeholder="条件" style="width: 100%; margin-bottom: 8px">
                    <el-option label="等于" value="eq" />
                    <el-option label="不等于" value="neq" />
                  </el-select>
                  <el-input v-model="activeField.hiddenCondition.value" placeholder="条件值" />
                </div>
              </el-form-item>

              <!-- ===== 以下为各控件类型的专属配置 ===== -->

              <!-- 数字输入专属 -->
              <template v-if="activeField.type === 'number'">
                <el-divider content-position="left">数字配置</el-divider>
                <el-form-item label="最大值">
                  <el-input-number v-model="activeField.validation.max" style="width: 100%" placeholder="不限制" />
                </el-form-item>
                <el-form-item label="最小值">
                  <el-input-number v-model="activeField.validation.min" style="width: 100%" placeholder="不限制" />
                </el-form-item>
                <el-form-item label="小数位数">
                  <el-input-number v-model="activeField.validation.decimals" :min="0" :max="4" style="width: 100%" />
                </el-form-item>
                <el-form-item label="步长">
                  <el-input-number v-model="activeField.props.step" :min="0.01" style="width: 100%" />
                </el-form-item>
                <el-form-item label="允许负数">
                  <el-switch v-model="activeField.props.allowNegative" />
                </el-form-item>
                <el-form-item label="输入类型">
                  <el-select v-model="activeField.props.inputType" style="width: 100%">
                    <el-option label="普通数字" value="number" />
                    <el-option label="手机号" value="phone" />
                    <el-option label="邮箱" value="email" />
                    <el-option label="身份证" value="idcard" />
                    <el-option label="URL" value="url" />
                  </el-select>
                </el-form-item>
              </template>

              <!-- 多行文本专属 -->
              <template v-if="activeField.type === 'textarea'">
                <el-divider content-position="left">多行文本配置</el-divider>
                <el-form-item label="最大长度">
                  <el-input-number v-model="activeField.validation.maxLength" :min="1" style="width: 100%" placeholder="不限制" />
                </el-form-item>
                <el-form-item label="显示行数">
                  <el-input-number v-model="activeField.props.rows" :min="2" :max="10" style="width: 100%" />
                </el-form-item>
                <el-form-item label="支持富文本">
                  <el-switch v-model="activeField.props.richText" />
                </el-form-item>
              </template>

              <!-- 日期选择专属 -->
              <template v-if="['date', 'dateRange'].includes(activeField.type)">
                <el-divider content-position="left">日期配置</el-divider>
                <el-form-item label="可选范围">
                  <el-select v-model="activeField.validation.dateRange" style="width: 100%">
                    <el-option label="无限制" value="none" />
                    <el-option label="今天及以后" value="future" />
                    <el-option label="今天及以前" value="past" />
                    <el-option label="自定义范围" value="custom" />
                  </el-select>
                </el-form-item>
                <template v-if="activeField.validation.dateRange === 'custom'">
                  <el-form-item label="最小日期">
                    <el-date-picker v-model="activeField.validation.minDate" type="date" placeholder="选择最小日期" style="width: 100%" />
                  </el-form-item>
                  <el-form-item label="最大日期">
                    <el-date-picker v-model="activeField.validation.maxDate" type="date" placeholder="选择最大日期" style="width: 100%" />
                  </el-form-item>
                </template>
                <el-form-item label="日期格式">
                  <el-select v-model="activeField.props.format" style="width: 100%">
                    <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                    <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                    <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                  </el-select>
                </el-form-item>
              </template>

              <!-- 下拉选择/单选/多选专属 -->
              <template v-if="['select', 'radio', 'checkbox'].includes(activeField.type)">
                <el-divider content-position="left">选项配置</el-divider>
                <el-form-item label="选项配置">
                  <div class="option-config">
                    <div
                        v-for="(opt, idx) in activeField.props.options"
                        :key="idx"
                        class="option-item"
                    >
                      <el-input v-model="opt.label" placeholder="选项名称" size="small" style="flex: 1" />
                      <el-input v-model="opt.value" placeholder="选项值" size="small" style="flex: 1; margin-left: 8px" />
                      <el-button
                          v-if="activeField.props.options.length > 1"
                          size="small"
                          type="danger"
                          link
                          icon="Delete"
                          @click="removeOption(idx)"
                      />
                    </div>
                    <el-button size="small" type="primary" link icon="Plus" @click="addOption" style="width: 100%">
                      添加选项
                    </el-button>
                  </div>
                </el-form-item>
                <el-form-item label="数据来源">
                  <el-radio-group v-model="activeField.props.optionSource">
                    <el-radio label="manual">手动配置</el-radio>
                    <el-radio label="dict">数据字典</el-radio>
                    <el-radio label="api">接口获取</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item v-if="activeField.props.optionSource === 'dict'" label="数据字典">
                  <el-select v-model="activeField.props.dictCode" placeholder="选择数据字典" style="width: 100%">
                    <el-option label="请假类型" value="leave_type" />
                    <el-option label="报销科目" value="expense_category" />
                    <el-option label="城市列表" value="city_list" />
                  </el-select>
                </el-form-item>
                <el-form-item v-if="activeField.props.optionSource === 'api'" label="接口地址">
                  <el-input v-model="activeField.props.apiUrl" placeholder="请输入接口地址" />
                </el-form-item>
                <!-- 多选数量限制 -->
                <el-form-item v-if="activeField.type === 'checkbox'" label="最多选择">
                  <el-input-number v-model="activeField.props.maxSelect" :min="1" style="width: 100%" placeholder="不限制" />
                </el-form-item>
              </template>

              <!-- 开关组件专属 -->
              <template v-if="activeField.type === 'switch'">
                <el-divider content-position="left">开关配置</el-divider>
                <el-form-item label="默认状态">
                  <el-switch v-model="activeField.props.defaultValue" />
                </el-form-item>
                <el-form-item label="开启文字">
                  <el-input v-model="activeField.props.activeText" placeholder="开启时显示的文字" />
                </el-form-item>
                <el-form-item label="关闭文字">
                  <el-input v-model="activeField.props.inactiveText" placeholder="关闭时显示的文字" />
                </el-form-item>
              </template>

              <!-- 附件上传专属 -->
              <template v-if="activeField.type === 'upload'">
                <el-divider content-position="left">附件配置</el-divider>
                <el-form-item label="最大文件大小">
                  <el-input-number v-model="activeField.props.maxSize" :min="1" style="width: 100%" placeholder="单位：MB" />
                  <span class="form-tip">单位：MB</span>
                </el-form-item>
                <el-form-item label="文件类型限制">
                  <el-select v-model="activeField.props.accept" multiple placeholder="选择允许的文件类型" style="width: 100%">
                    <el-option label="图片" value="image/*" />
                    <el-option label="文档" value=".doc,.docx,.pdf" />
                    <el-option label="表格" value=".xls,.xlsx" />
                    <el-option label="压缩包" value=".zip,.rar" />
                    <el-option label="全部" value="*" />
                  </el-select>
                </el-form-item>
                <el-form-item label="最大文件数量">
                  <el-input-number v-model="activeField.props.maxCount" :min="1" :max="10" style="width: 100%" />
                </el-form-item>
                <el-form-item label="允许删除">
                  <el-switch v-model="activeField.props.allowDelete" />
                </el-form-item>
                <el-form-item label="存储路径">
                  <el-input v-model="activeField.props.storagePath" placeholder="如：/upload/attachments" />
                </el-form-item>
              </template>

              <!-- 金额输入专属 -->
              <template v-if="activeField.type === 'money'">
                <el-divider content-position="left">金额配置</el-divider>
                <el-form-item label="货币符号">
                  <el-select v-model="activeField.props.currency" style="width: 100%">
                    <el-option label="¥ 人民币" value="CNY" />
                    <el-option label="$ 美元" value="USD" />
                    <el-option label="€ 欧元" value="EUR" />
                  </el-select>
                </el-form-item>
                <el-form-item label="最大值">
                  <el-input-number v-model="activeField.validation.max" style="width: 100%" placeholder="不限制" />
                </el-form-item>
                <el-form-item label="最小值">
                  <el-input-number v-model="activeField.validation.min" style="width: 100%" placeholder="不限制" />
                </el-form-item>
                <el-form-item label="小数位数">
                  <el-input-number v-model="activeField.validation.decimals" :min="0" :max="4" style="width: 100%" />
                </el-form-item>
              </template>

              <!-- 帮助文案 -->
              <el-form-item label="帮助文案" style="margin-top: 16px">
                <el-input
                    v-model="activeField.helpText"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入帮助文案"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- Tab2：校验规则 -->
          <el-tab-pane label="校验规则" name="validation">
            <el-form :model="activeField.validation" label-width="100px" size="small">
              <!-- 单行文本/多行文本 -->
              <template v-if="['input', 'textarea'].includes(activeField.type)">
                <el-form-item label="最大长度">
                  <el-input-number v-model="activeField.validation.maxLength" :min="1" style="width: 100%" placeholder="不限制" />
                </el-form-item>
                <el-form-item label="最小长度">
                  <el-input-number v-model="activeField.validation.minLength" :min="0" style="width: 100%" placeholder="不限制" />
                </el-form-item>
              </template>

              <!-- 数字输入 -->
              <template v-if="activeField.type === 'number'">
                <el-form-item label="最大值">
                  <el-input-number v-model="activeField.validation.max" style="width: 100%" placeholder="不限制" />
                </el-form-item>
                <el-form-item label="最小值">
                  <el-input-number v-model="activeField.validation.min" style="width: 100%" placeholder="不限制" />
                </el-form-item>
              </template>

              <!-- 日期选择 -->
              <template v-if="['date', 'datetime'].includes(activeField.type)">
                <el-form-item label="可选范围">
                  <el-select v-model="activeField.validation.dateRange" style="width: 100%">
                    <el-option label="无限制" value="none" />
                    <el-option label="今天及以后" value="future" />
                    <el-option label="今天及以前" value="past" />
                  </el-select>
                </el-form-item>
              </template>

              <!-- 自定义正则 -->
              <el-divider content-position="left">自定义校验</el-divider>
              <el-form-item label="预置正则">
                <el-select
                    v-model="activeField.validation.presetPattern"
                    placeholder="选择预置正则"
                    style="width: 100%"
                    @change="handlePresetPatternChange"
                >
                  <el-option label="手机号" value="phone" />
                  <el-option label="邮箱" value="email" />
                  <el-option label="身份证" value="idcard" />
                  <el-option label="URL" value="url" />
                  <el-option label="邮编" value="zipcode" />
                  <el-option label="自定义" value="custom" />
                </el-select>
              </el-form-item>
              <el-form-item label="正则表达式">
                <el-input v-model="activeField.validation.pattern" placeholder="如：^[0-9]+$" />
              </el-form-item>
              <el-form-item label="错误提示">
                <el-input v-model="activeField.validation.message" placeholder="校验失败时的提示" />
              </el-form-item>

              <!-- 校验时机 -->
              <el-divider content-position="left">校验时机</el-divider>
              <el-form-item label="校验时机">
                <el-checkbox-group v-model="activeField.validation.trigger">
                  <el-checkbox value="blur">失焦时</el-checkbox>
                  <el-checkbox value="change">输入时</el-checkbox>
                  <el-checkbox value="submit">提交时</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="校验失败处理">
                <el-switch v-model="activeField.validation.autoFocus" />
                <span class="form-tip" style="margin-left: 8px">自动聚焦到错误字段</span>
              </el-form-item>
              <el-form-item label="草稿模式跳过">
                <el-switch v-model="activeField.validation.skipOnDraft" />
                <span class="form-tip" style="margin-left: 8px">保存草稿时不校验</span>
              </el-form-item>

              <!-- 跨字段校验 -->
              <el-divider content-position="left">跨字段校验</el-divider>
              <el-form-item label="校验类型">
                <el-select v-model="activeField.validation.crossFieldType" placeholder="选择校验类型" style="width: 100%">
                  <el-option label="无" value="none" />
                  <el-option label="大于某字段" value="greater_than" />
                  <el-option label="小于某字段" value="less_than" />
                  <el-option label="等于某字段" value="equal_to" />
                  <el-option label="不等于某字段" value="not_equal_to" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="activeField.validation.crossFieldType !== 'none'" label="对比字段">
                <el-select v-model="activeField.validation.crossField" placeholder="选择对比字段" style="width: 100%">
                  <el-option
                      v-for="field in allFields"
                      :key="field.code"
                      :label="field.label"
                      :value="field.code"
                  />
                </el-select>
              </el-form-item>
              <el-form-item v-if="activeField.validation.crossFieldType !== 'none'" label="错误提示">
                <el-input v-model="activeField.validation.crossFieldMessage" placeholder="如：结束日期必须大于开始日期" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- Tab3：高级配置 -->
          <el-tab-pane label="高级配置" name="advanced">
            <el-form label-width="100px" size="small">
              <!-- 数据绑定 -->
              <el-divider content-position="left">数据绑定</el-divider>
              <el-form-item label="数据源类型">
                <el-select v-model="activeField.dataBindingType" placeholder="选择数据源类型" style="width: 100%">
                  <el-option label="无" value="" />
                  <el-option label="数据字典" value="dict" />
                  <el-option label="组织架构" value="org" />
                  <el-option label="接口数据" value="api" />
                  <el-option label="流程变量" value="variable" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="activeField.dataBindingType === 'dict'" label="数据字典">
                <el-select v-model="activeField.dataBinding" placeholder="选择数据字典" style="width: 100%">
                  <el-option label="请假类型" value="dict_leave_type" />
                  <el-option label="报销科目" value="dict_expense_category" />
                  <el-option label="城市列表" value="dict_city_list" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="activeField.dataBindingType === 'org'" label="组织类型">
                <el-select v-model="activeField.dataBinding" placeholder="选择组织类型" style="width: 100%">
                  <el-option label="人员列表" value="datasource_users" />
                  <el-option label="部门列表" value="datasource_depts" />
                  <el-option label="角色列表" value="datasource_roles" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="activeField.dataBindingType === 'api'" label="接口地址">
                <el-input v-model="activeField.dataBindingApi" placeholder="请输入接口地址" />
              </el-form-item>
              <el-form-item v-if="activeField.dataBindingType === 'org'" label="筛选条件">
                <el-input v-model="activeField.dataBindingFilter" placeholder="如：deptId=当前部门" />
              </el-form-item>
              <el-form-item v-if="['select', 'checkbox'].includes(activeField.type) && activeField.dataBindingType" label="支持多选">
                <el-switch v-model="activeField.dataBindingMultiple" />
              </el-form-item>

              <!-- 变量绑定 -->
              <el-divider content-position="left">变量绑定</el-divider>
              <el-form-item label="绑定变量">
                <el-select v-model="activeField.variableBinding" placeholder="绑定流程变量" style="width: 100%">
                  <el-option label="无" value="" />
                  <el-option label="${day_num} 请假天数" value="day_num" />
                  <el-option label="${money} 报销金额" value="money" />
                  <el-option label="${user_name} 申请人" value="user_name" />
                  <el-option label="${dept_name} 申请部门" value="dept_name" />
                </el-select>
              </el-form-item>
              <el-form-item label="变量表达式">
                <el-input v-model="activeField.variableExpression" placeholder="如：currentUser.department" />
                <div class="form-tip">支持变量表达式，自动带出关联数据</div>
              </el-form-item>

              <!-- 字段权限 -->
              <el-divider content-position="left">字段权限</el-divider>
              <el-form-item label="权限类型">
                <el-select v-model="activeField.fieldPermission" placeholder="设置字段权限" style="width: 100%">
                  <el-option label="可编辑" value="edit" />
                  <el-option label="只读" value="readonly" />
                  <el-option label="隐藏" value="hidden" />
                  <el-option label="必填" value="required" />
                </el-select>
              </el-form-item>
              <el-form-item label="权限主体">
                <el-select v-model="activeField.fieldPermissionTarget" placeholder="选择权限主体" style="width: 100%">
                  <el-option label="全局生效" value="global" />
                  <el-option label="指定角色" value="role" />
                  <el-option label="指定部门" value="dept" />
                  <el-option label="指定人员" value="user" />
                  <el-option label="流程节点" value="node" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="activeField.fieldPermissionTarget !== 'global'" label="权限范围">
                <el-select v-model="activeField.fieldPermissionValue" multiple placeholder="选择权限范围" style="width: 100%">
                  <el-option label="发起节点" value="node_start" />
                  <el-option label="审批节点" value="node_approve" />
                  <el-option label="部门经理" value="role_dept_manager" />
                  <el-option label="总经理" value="role_general_manager" />
                </el-select>
              </el-form-item>

              <!-- 联动规则 -->
              <el-divider content-position="left">联动规则</el-divider>
              <el-form-item label="联动规则">
                <el-button size="small" type="primary" @click="$emit('open-linkage')">
                  配置联动规则
                </el-button>
                <div class="form-tip" style="margin-top: 8px">
                  已配置 <el-tag size="small" type="success">{{ linkageRules.length }}</el-tag> 条规则
                </div>
                <div v-if="linkageRules.length > 0" class="linkage-rule-list">
                  <div
                      v-for="(rule, idx) in linkageRules"
                      :key="idx"
                      class="linkage-rule-item"
                  >
                    <span class="rule-text">{{ rule.description }}</span>
                    <el-switch v-model="rule.enabled" size="small" inline-prompt active-text="启" inactive-text="禁" />
                  </div>
                </div>
              </el-form-item>

              <!-- 计算公式（数字/金额字段） -->
              <el-form-item v-if="['number', 'money'].includes(activeField.type)" label="计算公式">
                <el-input v-model="activeField.formula" placeholder="如：price * quantity" />
                <div class="form-tip">支持四则运算，自动计算结果</div>
              </el-form-item>

              <!-- 事件配置 -->
              <el-divider content-position="left">事件配置</el-divider>
              <el-form-item label="事件类型">
                <el-checkbox-group v-model="activeField.events">
                  <el-checkbox value="click">点击</el-checkbox>
                  <el-checkbox value="focus">聚焦</el-checkbox>
                  <el-checkbox value="blur">失焦</el-checkbox>
                  <el-checkbox value="change">值变化</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>

      <el-empty v-else description="选择字段以编辑属性" :image-size="80" />    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { QuestionFilled, Delete, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  activeField: {
    type: Object,
    default: null
  },
  linkageRules: {
    type: Array,
    default: () => []
  },
  allFields: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['open-linkage', 'update:activeField'])

const activeTab = ref('basic')

// 预置正则表达式
const presetPatterns = {
  phone: '^1[3-9]\\d{9}$',
  email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  idcard: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$',
  url: '^https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$',
  zipcode: '^\\d{6}$'
}

// 预置正则错误提示
const presetMessages = {
  phone: '请输入正确的手机号',
  email: '请输入正确的邮箱地址',
  idcard: '请输入正确的身份证号',
  url: '请输入正确的URL地址',
  zipcode: '请输入正确的邮编'
}

// 处理预置正则选择
const handlePresetPatternChange = (value) => {
  if (props.activeField && value !== 'custom') {
    props.activeField.validation.pattern = presetPatterns[value] || ''
    props.activeField.validation.message = presetMessages[value] || ''
  }
}

// 显示占位提示的控件类型
const showPlaceholder = computed(() => {
  if (!props.activeField) return false
  return ['input', 'textarea', 'number', 'select', 'date', 'dateRange'].includes(props.activeField.type)
})

// 显示默认值的控件类型
const showDefaultValue = computed(() => {
  if (!props.activeField) return false
  return !['upload', 'signature', 'image', 'grid', 'group', 'card', 'divider', 'title', 'blank'].includes(props.activeField.type)
})

// 显示标签位置的控件类型
const showLabelPosition = computed(() => {
  if (!props.activeField) return false
  return !['switch', 'checkbox', 'radio', 'upload', 'signature', 'image'].includes(props.activeField.type)
})

// 添加选项
const addOption = () => {
  if (!props.activeField.props.options) {
    props.activeField.props.options = []
  }
  const idx = props.activeField.props.options.length + 1
  props.activeField.props.options.push({ label: `选项${idx}`, value: `option${idx}` })
}

// 删除选项
const removeOption = (index) => {
  props.activeField.props.options.splice(index, 1)
}
</script>

<style scoped lang="scss">
.property-panel {
  width: 100%;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100%;

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    color: #303133;

    .panel-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
    }
  }

  .panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .property-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }

    :deep(.el-form-item) {
      margin-bottom: 14px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(.el-divider) {
      margin: 16px 0;
    }

    :deep(.el-divider__text) {
      font-weight: 500;
      font-size: 13px;
      color: #303133;
    }
  }
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;

  .el-icon {
    font-size: 14px;
  }
}

.condition-config {
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.option-config {
  width: 100%;

  .option-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.linkage-rule-list {
  margin-top: 8px;

  .linkage-rule-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 6px;
    font-size: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .rule-text {
      color: #606266;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 8px;
    }
  }
}
</style>
