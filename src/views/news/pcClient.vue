<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="center" label="分类名" width="300" prop="catalog"></el-table-column>
      <el-table-column align="center" label="语言" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.language | languageFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建人" width="100" prop="creator_name"></el-table-column>
      <el-table-column align="center" label="创建时间" width="200" prop="create_time">
        <template slot-scope="scope">
          <span>{{scope.row.create_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="修改人" width="100" prop="modifier_name"></el-table-column>
      <el-table-column align="center" label="修改时间" width="200" prop="modify_time">
        <template slot-scope="scope">
          <span>{{scope.row.modify_time | parseTime}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('table.actions')" width="310" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{$t('table.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="tempInfo" label-position="left" label-width="170px" style='margin-left:50px;'>
        <el-form-item label="分类名" prop="catalog">
          <el-input v-model="tempInfo.catalog"></el-input>
        </el-form-item>
        <el-form-item label="语言" prop="language">
          <el-select clearable class="filter-item" v-model="tempInfo.language" placeholder="请选择">
            <el-option v-for="item in languageList" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button v-if="dialogStatus=='update'" @click="handleDetail(tempInfo)" style="margin-left: 50px;">编辑详情</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else-if="dialogStatus=='update'" type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { categoryFetchAll, categoryCreate, categoryUpdate, categoryDelete } from '@/api/news'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'newsPcClient',
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
        languageList: [{
          id: 0,
          label: '中文'
        }, {
          id: 1,
          label: '英文'
        }],
        rules: {
          catalog: [{ required: true, message: '请填写', trigger: 'blur' }],
          language: [{ required: true, message: '请选择', trigger: 'blur' }]
        },
        updatingObj: ''
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        categoryFetchAll(this.query).then(result => {
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
          categoryDelete(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.getList()
          })
        })
      },
      resetTemp() {
        this.tempInfo = {
          catalog: '',
          language: ''
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            categoryCreate(this.tempInfo).then(data => {
              this.query.currPage = 1
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(row) {
        this.updatingObj = row
        this.tempInfo = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            categoryUpdate(this.tempInfo, this.updatingObj).then((res) => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleDetail(row) {
        this.$router.push({
          path: 'news-list',
          query: {
            categoryId: row.id,
            categoryName: row.catalog
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
