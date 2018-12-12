<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input style="width: 200px;" class="filter-item" placeholder="请输入UID" v-model="query.accountId"></el-input>-->
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入账号" v-model="query.account"></el-input>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.status" @change="handleFilter" placeholder="请选择审核状态">
        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-date-picker v-model="query.createStartTime" class="filter-item" type="datetime" placeholder="请选择申请开始日期"></el-date-picker>
      <el-date-picker v-model="query.createEndTime" class="filter-item" type="datetime" placeholder="请选择申请结束日期"></el-date-picker>
      <!--<el-checkbox class="filter-item" style='margin-left:15px;' v-model="query.sortAsc">按申请时间正序排列</el-checkbox>-->
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" icon="el-icon-search">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="min-height:500px;">
      <el-table-column align="center" label="状态" width="100" prop="status">
        <template slot-scope="scope">
          <span>{{scope.row.status | statusFilter}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" label="UID" width="50" prop="account_id"></el-table-column>-->
      <el-table-column align="center" label="邮箱" width="150" prop="email"></el-table-column>
      <el-table-column align="center" label="区号" width="50" prop="area_code"></el-table-column>
      <el-table-column align="center" label="电话" width="120" prop="mobile_number"></el-table-column>
      <el-table-column align="center" label="提现币种" width="80" prop="coin_code"></el-table-column>
      <el-table-column align="center" label="提现地址" width="150" prop="to_address"></el-table-column>
      <el-table-column align="center" label="转入地址" width="150" prop="from_address"></el-table-column>
      <el-table-column align="center" label="申请日期" width="180" prop="create_time">
        <template slot-scope="scope">
          <span>{{scope.row.create_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="审批人" width="150" prop="verifier_id"></el-table-column>
      <el-table-column align="center" label="审批日期" width="180" prop="modify_time">
        <template slot-scope="scope">
          <span>{{scope.row.modify_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" width="150" prop="info"></el-table-column>
      <el-table-column align="center" label="审批" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 1" type="primary" size="mini" @click="handleAudit(scope.row, 'pass')">通过</el-button>
          <el-button v-if="scope.row.status === 1" size="mini" type="danger" @click="handleAudit(scope.row, 'reject')">拒绝</el-button>
          <el-button v-if="scope.row.status === 3" type="success" size="mini" @click="handleResult(scope.row, 'success')">成功</el-button>
          <el-button v-if="scope.row.status === 3" size="mini" type="warning" @click="handleResult(scope.row, 'fail')">失败</el-button>
          <span v-if="scope.row.status !== 1 && scope.row.status !== 3">{{scope.row.status | statusFilter}}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" :inline="true" ref="dataForm" :model="temp" label-position="left" label-width="120px" style='margin-left:50px;'>
        <el-form-item label="系统提现地址" prop="from_address">
          <el-input v-model="temp.from_address"></el-input>
        </el-form-item>
        <el-form-item label="区块链交易ID" prop="tx_hash" class="item-right">
          <el-input v-model="temp.tx_hash"></el-input>
        </el-form-item>
        <el-form-item label="交易区块" prop="block">
          <el-input v-model="temp.block"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="info" class="item-right">
          <el-input type="textarea" v-model="temp.info" :rows="3" style="width: 500px"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="resultConfirm(dialogStatus)">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  // customerInfoCheck
  import { withdrawFetchAll, withdrawVerifyHandling, withdrawVerifyRefuse, withdrawSuccess, withdrawFail } from '@/api/audit'
  import waves from '@/directive/waves' // 水波纹指令
  import { parseTime, kebabCaseData2Camel } from '@/utils'
  import imageView from 'vue-imageview'

  export default {
    name: 'customerAudit',
    components: {
      'image-view': imageView
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          1: '待审核',
          2: '审核不通过',
          3: '处理中',
          4: '成功',
          5: '失败'
        }
        return statusMap[status]
      }
    },
    directives: {
      waves
    },
    data() {
      return {
        list: null,
        total: null,
        listLoading: true,
        query: {
          currPage: 1,
          pageSize: 15
        },
        statusList: [{
          id: 1,
          label: '待审核'
        }, {
          id: 2,
          label: '审核不通过'
        }, {
          id: 3,
          label: '处理中'
        }, {
          id: 4,
          label: '成功'
        }, {
          id: 5,
          label: '失败'
        }],
        temp: {
          id: '',
          info: '',
          from_address: '',
          tx_hash: '',
          block: ''
        },
        dialogStatus: '',
        textMap: {
          success: '成功',
          fail: '失败'
        },
        dialogFormVisible: false,
        rules: '',
        successRules: {
          from_address: [{ required: true, message: '请填写', trigger: 'blur' }],
          tx_hash: [{ required: true, message: '请填写', trigger: 'blur' }],
          block: [{ required: true, message: '请填写', trigger: 'blur' }]
        },
        failRules: {
          info: [{ required: false, message: '请填写', trigger: 'blur' }]
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      },
      resetTemp() {
        this.temp.from_address = ''
        this.temp.tx_hash = ''
        this.temp.block = ''
        this.temp.info = ''
      },
      resultConfirm(type) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            if (type === 'success') {
              withdrawSuccess(kebabCaseData2Camel(this.temp)).then(result => {
                this.$message({
                  type: 'success',
                  message: '操作成功'
                })
                this.dialogFormVisible = false
                this.getList()
              })
            } else {
              withdrawFail(kebabCaseData2Camel(this.temp)).then(result => {
                this.$message({
                  type: 'success',
                  message: '操作成功'
                })
                this.dialogFormVisible = false
                this.getList()
              })
            }
          }
        })
      },
      handleResult(row, type) {
        this.resetTemp()
        this.temp.id = row.id
        this.dialogStatus = type
        this.rules = type === 'success' ? this.successRules : this.failRules
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleAudit(row, type) {
        const content = type === 'pass' ? '确定通过审核？' : '确定 不通过审核？'
        this.$prompt(content, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputPlaceholder: '备注',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              if (type === 'reject' && !instance.inputValue) {
                this.$message.error('请填写不通过的理由！')
                return
              }
              done()
            } else {
              done()
            }
          }
        }).then(({ value }) => {
          const para = {
            id: row.id,
            info: value
          }
          if (type === 'pass') {
            withdrawVerifyHandling(para).then(res => {
              this.$message({
                type: 'success',
                message: '操作成功'
              })
              this.getList()
            })
          } else {
            withdrawVerifyRefuse(para).then(res => {
              this.$message({
                type: 'success',
                message: '操作成功'
              })
              this.getList()
            })
          }
        })
      },
      getList() {
        this.listLoading = true
        const para = Object.assign({}, this.query)
        if (para.createStartTime) {
          para.createStartTime = parseTime(para.createStartTime)
        }
        if (para.createEndTime) {
          para.createEndTime = parseTime(para.createEndTime)
        }
        withdrawFetchAll(para).then(result => {
          this.listLoading = false
          this.list = result.data
          this.total = result.pageInfo.totalCount
          if (this.list.length === 0 && this.query.currPage !== 1) {
            this.getList()
          }
        })
      },
      handleSizeChange(val) {
        this.query.pageSize = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.query.currPage = val
        this.getList()
      }
    }
  }
</script>
<style scoped>
  .dialog-item {
    padding: 10px 0;
  }
</style>
