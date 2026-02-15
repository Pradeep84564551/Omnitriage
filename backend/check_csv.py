import pandas as pd

try:
    df = pd.read_csv('patients_dataset.csv')
    print("Columns:", df.columns.tolist())
    
    if 'Department' in df.columns:
        print("\nUnique Departments:", df['Department'].unique())
        print("\nFirst 5 rows Department:")
        print(df['Department'].head())
    else:
        print("\n'Department' column not found!")
        # Check for matching columns with whitespace
        for col in df.columns:
            if 'Department' in col:
                print(f"Found similar column: '{col}'")

except Exception as e:
    print(f"Error: {e}")
