```markdown
# Change SEO Meta Year to Current Year

This script updates the SEO meta fields (`seo_title`, `seo_description`, `seo_keywords`) from the year 2024 to 2025 in the `brands` collection.

```mongosh
let changedCount = 0;

db.brands.find({
    $or: [
        { seo_title: /2024/ },
        { seo_description: /2024/ },
        { seo_keywords: /2024/ }
    ]
}).forEach(item => {
    let previousValues = {};
    let updatedFields = {};
    let isChanged = false;

    Object.entries(item).forEach(([field, value]) => {
        if (["seo_title", "seo_description", "seo_keywords"].includes(field) && /2024/.test(value)) {
            previousValues[field] = value;
            updatedFields[field] = value.replace(/2024/g, "2025");
            isChanged = true;
        }
    });

    if (isChanged) {
        print("ID:", item._id);
        print("Previous:", JSON.stringify(previousValues));
        print("Updated:", JSON.stringify(updatedFields));

        db.brands.updateOne({ _id: item._id }, { $set: updatedFields });
        changedCount++;
    }
});

print("Total Changed Rows:", changedCount);
```

