<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="left" label="标题" width="450" prop="title"></el-table-column>
      <el-table-column align="center" label="内容" width="400" prop="content">
        <template slot-scope="scope">
          <p v-html="scope.row.content"></p>
        </template>
      </el-table-column>
      <el-table-column align="center" label="发布时间" width="160" prop="incident_time">
        <template slot-scope="scope">
          <span>{{scope.row.incident_time | parseTime}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" label="修改人" width="100" prop="modifier_name"></el-table-column>-->
      <!--<el-table-column align="center" label="修改时间" width="160" prop="modify_time">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{scope.row.modify_time | parseTime}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->

      <el-table-column align="center" :label="$t('table.actions')" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{$t('table.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
  import { newsListFetchAll, newsListDelete } from '@/api/news'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'newsList',
    components: {
    },
    directives: {
      waves
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        query: {
          currPage: 1,
          pageSize: 15
        },
        tempInfo: {
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '添加',
          copy: '复制'
        },
        rules: {
          title: [{ required: true, message: '请填写', trigger: 'blur' }],
          language: [{ required: true, message: '请填写', trigger: 'blur' }]
        },
        updatingObj: '',
        coinFeeTemplateList: [],
        coinList: [],
        isEdit: false
      }
    },
    created() {
      this.query.id = 1
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        newsListFetchAll(this.query).then(result => {
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
      },
      handleDelete(row) {
        this.$confirm('确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          newsListDelete(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.getList()
          })
        })
      },
      handleCreate() {
        this.$router.push({
          path: 'news-detail',
          query: {
            categoryId: this.query.id
          }
        })
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      },
      handleUpdate(row) {
        this.$router.push({
          path: 'news-detail',
          query: {
            titleId: row.id,
            categoryId: this.query.id
          }
        })
      }
    }
  }
</script>
<style scoped>
  .item-right {
    margin-left: 60px;
  }
</style>
