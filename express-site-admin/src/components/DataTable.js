import React from 'react'
import { DataGrid } from "@mui/x-data-grid";

const DataTable = ({ channel, columns, totalDocs, paginationModel, setPaginationModel }) => {
  return (
    <DataGrid
      rows={channel}
      columns={columns}
      rowCount={totalDocs}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      disableSelectionOnClick
      sx={{
        border: 0,
        color: 'var(--cui-body-color)',
        backgroundColor: 'var(--cui-body-bg)',
        "& .MuiDataGrid-columnHeader": {
          backgroundColor: 'var(--cui-body-bg)',
          color: 'var(--cui-body-color)',
        },
        "& .MuiDataGrid-scrollbarFiller": {
          backgroundColor: 'var(--cui-body-bg)',
          color: 'var(--cui-body-color)',
        },
        "& .super-app-theme--header": {
          fontWeight: 'bold !important',
        },
        "& .MuiDataGrid-footerContainer": {
          backgroundColor: 'var(--cui-body-bg)',
          color: 'var(--cui-body-color)',
        },
        "& .MuiTablePagination-displayedRows": {
          color: 'var(--cui-body-color)',
          fontSize: '1.2rem',
          marginBottom: 0,
        },
        "& .MuiTablePagination-actions > button": {
          color: 'var(--cui-body-color)',
        },
        "& .MuiTablePagination-actions > button > svg": {
          fill: 'var(--cui-body-color)',
          fontSize: '1.7rem',
        },
        "& .MuiTablePagination-actions > button.Mui-disabled > svg": {
          fill: 'var(--cui-body-color-disabled, grey)',
          opacity: 0.5,
        },
        "& .MuiDataGrid-row": {
          backgroundColor: 'var(--cui-body-bg)',
          color: 'var(--cui-body-color)',
        },
        "& .MuiToolbar-root": {
          alignItems: 'center',
          fontSize: '1rem',
        },
        "& .MuiDataGrid-cell": {
          borderColor: 'var(--cui-border-color)',
        },
        flex: 1,
      }}
      className="dark:text-white"
    />
  )
}

export default DataTable
