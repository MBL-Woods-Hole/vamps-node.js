#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

tmp_path    <- args[1]
prefix      <- args[2]
metric      <- args[3]
depth       <- args[4]

biom_file <- paste(tmp_path,'/',prefix,'_count_matrix.biom',sep='')


#biom_file <- args[1]
#method <- args[2]   # distance

#prefix <- args[4]


#pdf_file = paste("/Users/avoorhis/node_projects/vamps-node.js/public/tmp_images/",prefix,"_heatmap.pdf",sep='')
#pdf_file = paste("public/tmp_images/",prefix,"_heatmap.pdf",sep='')
out_file = paste(tmp_path,'/',prefix,"_fheatmap.pdf",sep='')

# /groups/vampsweb/vamps/seqinfobin/bin/Rscript --no-save --slave --no-restore 
# fheatmap.R /usr/local/www/vamps/docs/tmp/avoorhis_1784983_normalized.mtx avoorhis_1784983 Phylum horn yes

library(pheatmap) 
library(RColorBrewer)
#library(pracma)
library(jsonlite,quietly=TRUE)
require(vegan,quietly=TRUE);

myjson<-fromJSON(biom_file)
data_matrix<-myjson$data
rownames(data_matrix)<-myjson$rows$id
colnames(data_matrix)<-myjson$columns$id
print(colnames(data_matrix))
x<-data_matrix



#  x remove empty columns (datasets)
x<-x[,colSums(x) > 0]

ncols<-ncol(x)
nrows<-nrow(x)

# rows (taxa)
if (nrow(x) <= 30 ){
    h<-(nrow(x)*.14)+6
}else if(nrow(x) > 30 && nrow(x) <= 80){
    h<-(nrow(x)*.13)+5
}else if(nrow(x) > 80 && nrow(x) <= 150){
    h<-(nrow(x)*.13)+3
}else if(nrow(x) > 150 && nrow(x) <= 300){
    h<-(nrow(x)*.12)+2
}else if(nrow(x) > 300 && nrow(x) <= 400){
    h<-(nrow(x)*.12)+2
}else if(nrow(x) > 400 && nrow(x) <= 500){
    h<-(nrow(x)*.12)+2
}else if(nrow(x) > 500 && nrow(x) <= 600){
    h<-(nrow(x)*.12)+2
}else if(nrow(x) > 600 && nrow(x) <= 700){
    h<-(nrow(x)*.11)+1
}else if(nrow(x) > 700 && nrow(x) <= 800){
    h<-(nrow(x)*.11)+1
}else if(nrow(x) > 800 && nrow(x) <= 900){
    h<-(nrow(x)*.1)+1
}else if(nrow(x) > 900 && nrow(x) <= 1000){
    h<-(nrow(x)*.1)+1
}else if(nrow(x) > 1000 && nrow(x) <= 1100){
    h<-(nrow(x)*.09)
}else if(nrow(x) > 1100 && nrow(x) <= 1200){
    h<-(nrow(x)*.09)
}else{
    
    h<-(nrow(x)*.1)
}

w<-(ncol(x)*0.2)+10


pdf_title="VAMPS Frequency Heatmap"


pdf(out_file, width=w, height=h, title=pdf_title)
#pdf(out_file)
#svg(out_file)

if(depth=="genus" || depth=="species" || depth=="strain"){
    r_margin=45
}else if(depth=="class" || depth=="order" || depth=="family"){
    r_margin=20
}else{
    r_margin=10
}
print(paste("rows:",nrow(x),"h:",h,"rmarg:",r_margin))
print(paste("cols:",ncol(x),"w:",w))
#print(paste("fontsize_row:",fontsize_row))

              
fontsize_row = 8

# clustering methods
if(metric=='horn'){ 
    dist <- 'horn'
    text <- "Morisita-Horn"
}else if(metric=='bray' || metric=='bray_curtis'){
    dist <- 'bray'
    text <- "Bray-Curtis"
}else if(metric=='jaccard'){
    dist <- 'jaccard'
    text <- "Jaccard"
}else if(metric=='manhattan'){
    dist <- 'manhattan'
    text <- "Manhattan"
}else if(metric=='gower'){
    dist <- 'gower'
    text <- "Gower"
}else if(metric=='euclidean'){
    dist <- 'euclidean'
    text <- "Euclidean"
}else if(metric=='canberra'){
    dist <- 'canberra'
    text <- "Canberra"
}else if(metric=='kulczynski'){
    dist <- 'kulczynski'
    text <- "Kulczynski"
}else if(metric=='mountford'){
    dist <- 'mountford'
    text <- "Mountford"
}else{
    dist <- 'horn'
    text <- "Morisita-Horn"
}
main_label=paste("VAMPS Frequency Heatmap\n--Taxonomic Level:",depth,"\n--Clustering: ",text)
dtaxa<-vegdist(x, method=dist)  # drows
d<-vegdist(t(x), method=dist, na.rm=TRUE)  # dcols
#d<t(x)
distance_file = paste(tmp_path,'/',prefix,'_distance.R',sep='')
write.table(as.matrix(d),file=distance_file)

#print(drows)
#print(x)
#v=function(x) vegdist(x, method=meth)
#print(v)
#aheatmap(x, col=mypalette, distfun = function(d) vegdist(d, method=meth), scale="row",
#        fontsize=fontsize_row,cellwidth=12,cellheight=6, main="aheatmap")
#stand <-decostand(k,"total");
#dis<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
# x = x * 10
#heatmap.2(x, col=mypalette, scale="row",
#        distfun=function(d) vegdist(d, method=meth), 
#            margins=c(16,r_margin), main="heatmap.2")
#            key=FALSE, symkey=FALSE, density.info="none", trace="none", cexRow=0.5)        
#pheatmap(x, col=mypalette3, scale="row", legend=FALSE,
#        clustering_distance_rows=vegdist(x, method=meth),
#        clustering_distance_cols=vegdist(t(x), method=meth), margins=c(15,r_margin),
#       fontsize_row=fontsize_row, cellwidth=12, cellheight=6, main="pheatmap3")

#
#mypalette1<-colorRampPalette(c("blue", "green", "yellow", "orange", "red"), bias=0.75)(128)
#mypalette2<-colorRampPalette(brewer.pal(12,"Set3"))(128)
#mypalette3<-colorRampPalette(brewer.pal(8,"Dark2"))(128)
#mypalette4<-colorRampPalette(brewer.pal(9,"BuPu"))(128)
#mypalette5<-colorRampPalette(brewer.pal(9,"PuBuGn"))(128)
mypalette6<-colorRampPalette(brewer.pal(12,"Paired"))(256)
#mypalette7<-colorRampPalette(c("#00007F", "blue", "#007FFF", "cyan",
#                     "#7FFF7F", "yellow", "#FF7F00", "red", "#7F0000"))(128)
#mypalette8<-colorRampPalette(c("red", "orange", "blue"),space = "Lab")(128)                    
#mypalette9<-colorRampPalette(c("blue", "magenta", "red", "yellow"), bias=0.75, space="Lab")(128)  

# scale will be yes if data is unnormalize; scale is un-needed otherwise

x1<-scale(x, center=FALSE, scale=colSums(x))

#print(x1)

pheatmap(x1,  scale="none", color=mypalette6,
			cluster_cols = FALSE, cluster_rows=TRUE, clustering_distance_rows=dtaxa,
			 margins=c(15,r_margin),
		   fontsize_row=fontsize_row, cellwidth=12, cellheight=6, main=main_label)


#print(warnings())
dev.off()


