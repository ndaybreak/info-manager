<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input type="number" style="width: 200px;" class="filter-item" placeholder="请输入ID" v-model="query.queryId"></el-input>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.changeType" @change="handleFilter" placeholder="请选择更改类型">
        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入更改内容" v-model="query.changeContent"></el-input>
      <el-input type="number" style="width: 200px;" class="filter-item" placeholder="请输入更改人ID" v-model="query.modifierId"></el-input>
      <el-date-picker v-model="query.startTime" class="filter-item" type="datetime" placeholder="请输入起始时间"></el-date-picker>
      <el-date-picker v-model="query.endTime" class="filter-item" type="datetime" placeholder="请输入结束时间"></el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="center" label="变动状态" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.change_type | statusFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="变动内容" width="650" prop="change_content"></el-table-column>
      <el-table-column align="center" label="ID" width="120" prop="merchant_level_id"></el-table-column>
      <el-table-column align="center" label="修改人ID" width="180" prop="modifier_id"></el-table-column>
      <el-table-column align="center" label="修改人" width="180" prop="modifier_name"></el-table-column>
      <el-table-column align="center" label="修改日期" width="200">
        <template slot-scope="scope">
          <span>{{scope.row.modify_time | parseTime}}</span>
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
  import { merchantLevelLog } from '@/api/query'
  import waves from '@/directive/waves' // 水波纹指令
  import { parseTime } from '@/utils'

  export default {
    name: 'customerLog',
    directives: {
      waves
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: '创建',
          1: '修改',
          2: '删除',
          3: '恢复'
        }
        return statusMap[status]
      }
    },
    data() {
      return {
        list: null,
        listLoading: true,
        total: null,
        query: {
          currPage: 1,
          pageSize: 15
        },
        statusList: [{
          id: 0,
          label: '创建'
        }, {
          id: 1,
          label: '修改'
        }, {
          id: 2,
          label: '删除'
        }, {
          id: 3,
          label: '恢复'
        }]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        const para = Object.assign({}, this.query)
        if (para.startTime) {
          para.startTime = parseTime(para.startTime)
        }
        if (para.endTime) {
          para.endTime = parseTime(para.endTime)
        }
        merchantLevelLog(para).then(response => {
          this.list = response.data
          this.listLoading = false
        })
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
