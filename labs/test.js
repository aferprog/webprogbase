function test(a, b){
    console.log(b(a));
}
function main(){
    const b=3;
    test(10, x=>x*b);
}
main();