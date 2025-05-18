<script setup>
const {
  execute: fetchUsers,
  data,
  error,
} = await useApi(createUrl('/base/user/get',

  // , {
  // query: {
  //   q: searchQuery,
  //   status: selectedStatus,
  //   plan: selectedPlan,
  //   role: selectedRole,
  //   itemsPerPage,
  //   page,
  //   sortBy,
  //   orderBy,
  // },
  // }
))
</script>

<template>
  <section />
</template>
