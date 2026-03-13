from fastapi import FastAPI
from parser import parse_resume
from model import predict_jobs

app =FastAPI()

@app.post("/parse")
def parse_file(data:dict):
    file_path=data['filePath']

    parsed_data=parse_resume(filePath)
    recommendations=predict_jobs(parsed_data)

    return {
        "parsedData" : parsed_data,
        "recommendations" : recommendations
    }