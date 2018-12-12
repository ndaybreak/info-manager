<template>
  <div class="app-container">
    <h4>{{title}}      <span style="margin-left: 50px;">邮箱：{{email}}</span></h4>
    <div class="filter-container">
      <el-date-picker v-model="query.begintime" class="filter-item" type="datetime" placeholder="请输入起始时间"></el-date-picker>
      <el-date-picker v-model="query.endtime" class="filter-item" type="datetime" placeholder="请输入结束时间"></el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="center" label="日期" width="300">
        <template slot-scope="scope">
          <span>{{scope.row.time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column label="内容" prop="content">
        <template slot-scope="scope">
          <span v-html="scope.row.content"></span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
  import { smRecordFetchAll, emailRecordFetchAll } from '@/api/push'
  import waves from '@/directive/waves' // 水波纹指令
  // import { parseTime } from '@/utils'

  export default {
    name: 'merchantDepositLog',
    directives: {
      waves
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          1: '缴纳',
          2: '退还',
          3: '扣罚'
        }
        return statusMap[status]
      }
    },
    data() {
      return {
        list: null,
        listLoading: true,
        total: null,
        type: '',
        query: {
          currPage: 1,
          pageSize: 15,
          userId: ''
        },
        statusList: [{
          id: 1,
          label: '缴纳'
        }, {
          id: 2,
          label: '退还'
        }, {
          id: 3,
          label: '扣罚'
        }],
        coinList: [],
        title: '',
        email: ''
      }
    },
    created() {
      this.query.userId = this.$route.query.userId
      this.type = this.$route.query.type
      this.email = this.$route.query.email
      if (this.type === 'sm') {
        this.title = '短信记录'
      } else {
        this.title = '邮件记录'
      }
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        const para = Object.assign({}, this.query)
        if (para.begintime) {
          para.begintime = para.begintime.getTime() / 1000
        }
        if (para.endtime) {
          para.endtime = para.endtime.getTime() / 1000
        }
        para.begintime = para.begintime || 0
        para.endtime = para.endtime || 1532574178154
        if (this.type === 'sm') {
          smRecordFetchAll(para).then(response => {
            this.list = response.data
            this.listLoading = false
          })
        } else {
          emailRecordFetchAll(para).then(response => {
            this.list = response.data
            this.listLoading = false
          })
        }
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
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

</style>
