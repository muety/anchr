#!/bin/bash

# constants
api_url="https://anchr.io/api/collection"
bearer_token="put your token here"
output_dir="/tmp/anchr_backup"
archive_file="/tmp/anchr_backup.tar.gz"

mkdir -p "$output_dir"

response=$(curl -H "Authorization: Bearer $bearer_token" -s "$api_url")

if [ $? -ne 0 ]; then
  echo "Failed to fetch data from $api_url"
  exit 1
fi

ids=$(echo "$response" | jq -r '.[]._id')
count=$(echo "$ids" | wc -l)

idx=0
for id in $ids; do
  idx=$((idx + 1))
  echo "Fetching collection $idx of $count"
  coll_url="https://anchr.io/api/collection/$id/links?page=1&pageSize=99999"
  response=$(curl -H "Authorization: Bearer $bearer_token" -s "$coll_url")

  if [ $? -ne 0 ]; then
    echo "Failed to fetch data for ID $id from $coll_url"
    continue
  fi

  echo "$response" > "$output_dir/${id}.json"
  # echo "Saved data for ID $id to $output_dir/${id}.json"
done

tar cfz "$archive_file" -C "$output_dir" .
echo "Created $archive_file"

rm -r "$output_dir"