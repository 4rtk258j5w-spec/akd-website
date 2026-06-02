"use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { db, storage } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
export default function SettingsPage() {
  const [d, setD] = useState<any>({siteName:"",siteNameEn:"",status:"",statusEn:"",statusColor:"#16a34a",primaryColor:"#ff9900",logoUrl:"",bio:"",bioEn:"",companyDesc:"",companyDescEn:"",phone:"",address:"",addressEn:"",mapLink:"",whatsapp:"",instagram:"",facebook:"",callNumber:"",email:"",openTime:"09:00",closeTime:"22:00",offDays:""});
  const [logoFile, setLogoFile] = useState<File|null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const up = (k:string,v:string) => setD((p:any)=>({...p,[k]:v}));
  useEffect(()=>{getDoc(doc(db,"settings","main")).then(s=>{if(s.exists())setD((p:any)=>({...p,...s.data()}))});},[]);
  const save = async()=>{
    setLoading(true);
    try{const data={...d};
      if(logoFile){const r=ref(storage,"settings/logo_"+Date.now());const t=uploadBytesResumable(r,logoFile);await new Promise<void>((res,rej)=>{t.on("state_changed",null,rej,async()=>{data.logoUrl=await getDownloadURL(t.snapshot.ref);res()})});}
      await setDoc(doc(db,"settings","main"),data);setD(data);setSuccess(true);setTimeout(()=>setSuccess(false),3000);
    }catch(e:any){alert(e.message)}setLoading(false);};
  const is:any={width:"100%",padding:"12px",backgroundColor:"#27272a",border:"1px solid #3f3f46",borderRadius:"10px",color:"white",outline:"none",boxSizing:"border-box",marginBottom:"10px",fontSize:"14px"};
  const lb:any={display:"block",marginBottom:"6px",color:"#a1a1aa",fontSize:"13px"};
  const ta:any={...is,height:"100px",resize:"vertical"};
  const sec:any={backgroundColor:"#18181b",border:"1px solid #27272a",borderRadius:"14px",padding:"20px",marginBottom:"20px"};
  const h2s:any={fontSize:"16px",color:"#0EA5E9",marginBottom:"16px"};
  return (
    <div style={{display:"flex",backgroundColor:"#09090b",minHeight:"100vh",color:"white"}}>
      <Sidebar />
      <div style={{flex:1,padding:"32px",overflowY:"auto"}} className="page-body">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
          <h1 style={{fontSize:"26px",fontWeight:"bold"}}>إعدادات الموقع</h1>
          <button onClick={save} disabled={loading} style={{backgroundColor:"#7c3aed",color:"white",fontWeight:"bold",padding:"10px 24px",borderRadius:"10px",border:"none",cursor:"pointer"}}>{loading?"جاري الحفظ...":"حفظ"}</button>
        </div>
        {success&&<div style={{backgroundColor:"#16a34a",color:"white",padding:"12px",borderRadius:"10px",marginBottom:"16px"}}>تم الحفظ!</div>}
        <div style={sec}>
          <h2 style={h2s}>معلومات الموقع</h2>
          <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"14px"}}>
            {d.logoUrl&&<img src={d.logoUrl} style={{width:"60px",height:"60px",objectFit:"cover",borderRadius:"10px"}}/>}
            <label style={{backgroundColor:"#27272a",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>{logoFile?logoFile.name:"صورة الموقع"}<input type="file" accept="image/*" hidden onChange={e=>{if(e.target.files?.[0])setLogoFile(e.target.files[0])}}/></label>
          </div>
          <label style={lb}>اسم الموقع (عربي)</label><input style={is} value={d.siteName} onChange={e=>up("siteName",e.target.value)}/>
          <label style={lb}>Site Name (English)</label><input style={is} value={d.siteNameEn} onChange={e=>up("siteNameEn",e.target.value)}/>
          <label style={lb}>حالة الموقع (عربي)</label><input style={is} value={d.status} onChange={e=>up("status",e.target.value)}/>
          <label style={lb}>Status (English)</label><input style={is} value={d.statusEn} onChange={e=>up("statusEn",e.target.value)}/>
          <label style={lb}>لون الحالة</label>
          <div style={{display:"flex",gap:"10px",marginBottom:"12px"}}>{["#16a34a","#dc2626","#f59e0b","#2563eb","#7c3aed"].map(c=><div key={c} onClick={()=>up("statusColor",c)} style={{width:"28px",height:"28px",borderRadius:"50%",backgroundColor:c,cursor:"pointer",border:d.statusColor===c?"3px solid white":"3px solid transparent"}}/>)}</div>
          <label style={lb}>🎨 اللون الرئيسي للموقع</label>
          <div style={{display:"flex",gap:"10px",marginBottom:"12px",flexWrap:"wrap"}}>{["#ff9900","#3b82f6","#10b981","#ef4444","#8b5cf6","#f43f5e","#ffffff"].map(c=><div key={c} onClick={()=>up("primaryColor",c)} style={{width:"32px",height:"32px",borderRadius:"8px",backgroundColor:c,cursor:"pointer",border:d.primaryColor===c?"3px solid white":"3px solid transparent"}}/>)}</div>
        </div>
        <div style={sec}>
          <h2 style={h2s}>السيرة الذاتية / About</h2>
          <label style={lb}>نبذة (عربي)</label><textarea style={ta} value={d.bio} onChange={e=>up("bio",e.target.value)} placeholder="نبذة عن الموقع..."/>
          <label style={lb}>About (English)</label><textarea style={ta} value={d.bioEn} onChange={e=>up("bioEn",e.target.value)} placeholder="About the website..."/>
        </div>
        <div style={sec}>
          <h2 style={h2s}>نشاطات الشركة / Company Activities</h2>
          <label style={lb}>شرح مفصل (عربي)</label><textarea style={{...ta,height:"150px"}} value={d.companyDesc} onChange={e=>up("companyDesc",e.target.value)} placeholder="شرح مفصل عن نشاطات الشركة..."/>
          <label style={lb}>Detailed Description (English)</label><textarea style={{...ta,height:"150px"}} value={d.companyDescEn} onChange={e=>up("companyDescEn",e.target.value)} placeholder="Detailed company activities description..."/>
        </div>
        <div style={sec}>
          <h2 style={h2s}>روابط التواصل</h2>
          <label style={lb}>WhatsApp</label><input style={is} value={d.whatsapp} onChange={e=>up("whatsapp",e.target.value)} placeholder="+9647XXXXXXXXX"/>
          <label style={lb}>Instagram</label><input style={is} value={d.instagram} onChange={e=>up("instagram",e.target.value)} placeholder="https://instagram.com/..."/>
          <label style={lb}>Facebook</label><input style={is} value={d.facebook} onChange={e=>up("facebook",e.target.value)} placeholder="https://facebook.com/..."/>
          <label style={lb}>رقم الاتصال / Call</label><input style={is} value={d.callNumber} onChange={e=>up("callNumber",e.target.value)} placeholder="07XXXXXXXXX"/>
          <label style={lb}>Email</label><input style={is} value={d.email} onChange={e=>up("email",e.target.value)} placeholder="info@example.com"/><label style={lb}>رابط الخريطة / Map</label><input style={is} value={d.mapLink} onChange={e=>up("mapLink",e.target.value)} placeholder="https://maps.google.com/..."/>
        </div>
        <div style={sec}>
          <h2 style={h2s}>العنوان / Address</h2>
          <label style={lb}>رقم الهاتف</label><input style={is} value={d.phone} onChange={e=>up("phone",e.target.value)} placeholder="07XXXXXXXXX"/>
          <label style={lb}>العنوان (عربي)</label><input style={is} value={d.address} onChange={e=>up("address",e.target.value)} placeholder="العراق، بابل..."/>
          <label style={lb}>ساعة الفتح</label><input style={is} type="time" value={d.openTime} onChange={e=>up("openTime",e.target.value)}/><label style={lb}>ساعة الإغلاق</label><input style={is} type="time" value={d.closeTime} onChange={e=>up("closeTime",e.target.value)}/><label style={lb}>أيام العطلة (مثال: الجمعة، السبت)</label><input style={is} value={d.offDays} onChange={e=>up("offDays",e.target.value)} placeholder="الجمعة"/><label style={lb}>Address (English)</label><input style={is} value={d.addressEn} onChange={e=>up("addressEn",e.target.value)} placeholder="Iraq, Babylon..."/>
        </div>
        <button onClick={save} disabled={loading} style={{backgroundColor:"#7c3aed",color:"white",fontWeight:"bold",padding:"12px",borderRadius:"10px",border:"none",cursor:"pointer",width:"100%"}}>{loading?"جاري الحفظ...":"حفظ جميع الإعدادات"}</button>
      </div>
    </div>);
}
