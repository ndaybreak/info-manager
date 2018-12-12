<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input style="width: 200px;" class="filter-item" placeholder="请输入UID" v-model="query.uid"></el-input>-->
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入账号" v-model="query.email"></el-input>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.status" @change="handleFilter" placeholder="请选择审核状态">
        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-date-picker v-model="query.beginTime" class="filter-item" type="datetime" placeholder="请选择申请开始日期"></el-date-picker>
      <el-date-picker v-model="query.endTime" class="filter-item" type="datetime" placeholder="请选择申请结束日期"></el-date-picker>
      <!--<el-checkbox class="filter-item" style='margin-left:15px;' v-model="query.sortAsc">按申请时间正序排列</el-checkbox>-->
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" icon="el-icon-search">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="min-height:500px;">
      <el-table-column align="center" label="状态" width="150" prop="status">
        <template slot-scope="scope">
          <span>{{scope.row.status | statusFilter}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" label="UID" width="150" prop="auth_application_id"></el-table-column>-->
      <el-table-column align="center" label="邮箱" width="150" prop="email"></el-table-column>
      <el-table-column align="center" label="区号" width="50" prop="area_code"></el-table-column>
      <el-table-column align="center" label="电话" width="150" prop="mobile_number"></el-table-column>
      <el-table-column align="center" label="认证材料" width="150">
        <template slot-scope="scope">
          <el-button round @click="checkAuthMaterials(scope.row)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="申请日期" width="200" prop="apply_time">
        <template slot-scope="scope">
          <span>{{scope.row.apply_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="审批人" width="150" prop="name"></el-table-column>
      <el-table-column align="center" label="审批日期" width="200">
        <template slot-scope="scope">
          <span>{{scope.row.approve_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" width="150" prop="approve_result_memo"></el-table-column>
      <el-table-column align="center" label="审批" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 0" type="primary" size="mini" @click="handleAudit(scope.row, 'pass')">通过</el-button>
          <el-button v-if="scope.row.status === 0" size="mini" type="danger" @click="handleAudit(scope.row, 'reject')">拒绝</el-button>
          <span v-if="scope.row.status !== 0">{{scope.row.status | statusFilter}}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="查看" :visible.sync="dialogFormVisible">
      <el-row>
        <el-col :span="12">
          <h3>基本信息</h3>
          <div class="dialog-item">姓名：{{tempInfo.full_name}}</div>
          <div class="dialog-item">出生日期：{{tempInfo.birthday}}</div>
        </el-col>
        <el-col :span="12">
          <h3>居住地信息</h3>
          <div class="dialog-item">地址：{{tempInfo.address}}</div>
          <div class="dialog-item">邮政编码：{{tempInfo.postal_code}}</div>
          <div class="dialog-item">城市：{{tempInfo.city}}</div>
          <div class="dialog-item">国家及地区：{{tempInfo.country_name_chinese}}</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <h3>客户上传图片信息</h3>
          <PictureView v-if="tempInfo.icons" :pictureList="tempInfo.icons"></PictureView>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { customerFetchAll, customerAudit, customerInfoCheck } from '@/api/audit'
  import waves from '@/directive/waves' // 水波纹指令
  // import { str2Bool, kebabCaseData2Camel } from '@/utils'
  import PictureView from 'vue-simple-picture-preview'

  export default {
    name: 'customerAudit',
    components: {
      PictureView
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: '未提交',
          1: '已拒绝',
          2: '审核通过',
          3: '审核中'
        }
        return statusMap[status]
      }
    },
    directives: {
      waves
    },
    data() {
      return {
        tempInfo: {
          icons: ['http://img3.redocn.com/20120410/Redocn_2012041007514574.jpg', 'http://img.sccnn.com/bimg/338/24556.jpg']
        },
        list: null,
        total: null,
        listLoading: true,
        query: {
          currPage: 1,
          pageSize: 15
        },
        dialogFormVisible: false,
        statusList: [{
          id: 0,
          label: '未提交'
        }, {
          id: 1,
          label: '已拒绝'
        }, {
          id: 2,
          label: '审核通过'
        }, {
          id: 3,
          label: '审核中'
        }]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      checkAuthMaterials(row) {
        this.tempInfo.icons = []
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        customerInfoCheck({ email: row.email }).then(result => {
          loading.close()
          const obj = result.data[0]
          Object.assign(this.tempInfo, obj)
          // this.tempInfo.icons = [obj.credential_back_pic_addr, obj.credential_front_pic_addr, obj.credential_sign_pic_addr]
          this.tempInfo.icons = ['http://img3.redocn.com/20120410/Redocn_2012041007514574.jpg', 'http://img.sccnn.com/bimg/338/24556.jpg']
          this.dialogFormVisible = true
        })
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      },
      handleAudit(row, type) {
        const content = type === 'pass' ? '确定通过审核？' : '确定 不通过审核？'
        this.$prompt(content, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputPlaceholder: '备注'
        }).then(({ value }) => {
          const para = {
            authApplicationId: row.auth_application_id,
            status: type === 'pass' ? 1 : 2,
            approveResultMemo: value
          }
          console.log(para)
          customerAudit(para).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功'
            })
            this.getList()
          })
        })
      },
      getList() {
        this.listLoading = true
        const para = Object.assign({}, this.query)
        if (para.beginTime) {
          para.beginTime = para.beginTime.getTime() / 1000
        }
        if (para.endTime) {
          para.endTime = para.endTime.getTime() / 1000
        }
        customerFetchAll(para).then(result => {
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
