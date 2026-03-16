export interface ArticlePageDto {
  Id: number;
  Title: string;
  FileLeafRef: string;
  FieldValuesAsText: {
    WH_Category: string;
    WH_Status: string;
    WH_IsMandatory: string;
    WH_TargetGroups: string;
    WH_Reviewer: string;
    WH_ReviewByDate: string;
  };
  Modified: string;
  Author: { Title: string; EMail: string };
  FileRef: string;
}
